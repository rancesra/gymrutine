package co.edu.uis.gymrutine.service;

import co.edu.uis.gymrutine.dto.RutinaRequest;
import co.edu.uis.gymrutine.dto.RutinaRequest.EjercicioRutinaRequest;
import co.edu.uis.gymrutine.dto.RutinaResponse;
import co.edu.uis.gymrutine.dto.RutinaResumenResponse;
import co.edu.uis.gymrutine.error.CodigoError;
import co.edu.uis.gymrutine.error.ErrorApi;
import co.edu.uis.gymrutine.model.Ejercicio;
import co.edu.uis.gymrutine.model.Rutina;
import co.edu.uis.gymrutine.repository.EjercicioRepository;
import co.edu.uis.gymrutine.repository.RutinaRepository;
import co.edu.uis.gymrutine.repository.UsuarioRepository;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Crear, ver, editar y eliminar rutinas (historias H10 a H13, reglas R1 y R3). */
@Service
public class RutinaService {

    private final RutinaRepository rutinaRepository;
    private final EjercicioRepository ejercicioRepository;
    private final UsuarioRepository usuarioRepository;

    public RutinaService(RutinaRepository rutinaRepository, EjercicioRepository ejercicioRepository,
            UsuarioRepository usuarioRepository) {
        this.rutinaRepository = rutinaRepository;
        this.ejercicioRepository = ejercicioRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public List<RutinaResumenResponse> listar(Long usuarioId) {
        return rutinaRepository.findByUsuarioIdAndActivaTrueOrderByNombreAsc(usuarioId).stream()
                .map(RutinaResumenResponse::desde)
                .toList();
    }

    /** Una rutina eliminada también se devuelve, con {@code activa: false}, para el historial. */
    @Transactional(readOnly = true)
    public RutinaResponse obtener(Long usuarioId, Long rutinaId) {
        return RutinaResponse.desde(buscar(usuarioId, rutinaId));
    }

    @Transactional
    public RutinaResponse crear(Long usuarioId, RutinaRequest datos) {
        Map<Long, Ejercicio> ejercicios = validarEjercicios(usuarioId, datos.ejercicios());
        Rutina rutina = new Rutina(usuarioRepository.getReferenceById(usuarioId), datos.nombre(), datos.objetivo());
        agregarEjercicios(rutina, datos.ejercicios(), ejercicios);
        return RutinaResponse.desde(rutinaRepository.save(rutina));
    }

    /**
     * Reemplaza nombre, objetivo y la lista completa. La lista se vacía y se vuelve a llenar:
     * {@code orphanRemoval} borra las filas que ya no están. Una rutina eliminada no se edita (404).
     */
    @Transactional
    public RutinaResponse actualizar(Long usuarioId, Long rutinaId, RutinaRequest datos) {
        Rutina rutina = buscar(usuarioId, rutinaId);
        if (!rutina.isActiva()) {
            throw rutinaNoEncontrada();
        }
        Map<Long, Ejercicio> ejercicios = validarEjercicios(usuarioId, datos.ejercicios());
        rutina.actualizar(datos.nombre(), datos.objetivo());
        agregarEjercicios(rutina, datos.ejercicios(), ejercicios);
        return RutinaResponse.desde(rutina);
    }

    /** Borrado lógico (R3). Si ya estaba eliminada no cambia nada, y el controller responde 204 igual. */
    @Transactional
    public void eliminar(Long usuarioId, Long rutinaId) {
        buscar(usuarioId, rutinaId).desactivar();
    }

    /** Una rutina de otro usuario responde igual que una que no existe. */
    private Rutina buscar(Long usuarioId, Long rutinaId) {
        return rutinaRepository.findByIdAndUsuarioId(rutinaId, usuarioId).orElseThrow(this::rutinaNoEncontrada);
    }

    private ErrorApi rutinaNoEncontrada() {
        return new ErrorApi(CodigoError.RUTINA_NO_ENCONTRADA, "La rutina no existe");
    }

    /**
     * Revisa que ningún ejercicio se repita y que cada uno sea visible para el usuario (R1) y esté activo (R3).
     * Un ejercicio inexistente, ajeno o eliminado es un error del cuerpo: 400 con el campo
     * {@code ejercicios[i].ejercicioId}, no 404. Devuelve los ejercicios por id para armar la rutina.
     */
    private Map<Long, Ejercicio> validarEjercicios(Long usuarioId, List<EjercicioRutinaRequest> lista) {
        Map<Long, Ejercicio> encontrados = ejercicioRepository
                .findAllById(lista.stream().map(EjercicioRutinaRequest::ejercicioId).toList()).stream()
                .collect(Collectors.toMap(Ejercicio::getId, Function.identity()));
        Map<String, String> campos = new LinkedHashMap<>();
        Set<Long> vistos = new HashSet<>();
        for (int i = 0; i < lista.size(); i++) {
            Long ejercicioId = lista.get(i).ejercicioId();
            Ejercicio ejercicio = encontrados.get(ejercicioId);
            String campo = "ejercicios[" + i + "].ejercicioId";
            if (!vistos.add(ejercicioId)) {
                campos.put(campo, "Este ejercicio ya está en la rutina");
            } else if (ejercicio == null || !ejercicio.isActivo() || !esVisible(ejercicio, usuarioId)) {
                campos.put(campo, "El ejercicio no existe o fue eliminado");
            }
        }
        if (!campos.isEmpty()) {
            throw new ErrorApi(CodigoError.VALIDACION_FALLIDA, "Hay campos con errores", campos);
        }
        return encontrados;
    }

    /** R1: el usuario ve los ejercicios base y los suyos. */
    private boolean esVisible(Ejercicio ejercicio, Long usuarioId) {
        return ejercicio.esBase() || ejercicio.getUsuario().getId().equals(usuarioId);
    }

    /** Agrega los ejercicios en el orden del arreglo: el orden queda 1, 2, 3… */
    private void agregarEjercicios(Rutina rutina, List<EjercicioRutinaRequest> lista, Map<Long, Ejercicio> ejercicios) {
        for (EjercicioRutinaRequest item : lista) {
            rutina.agregarEjercicio(ejercicios.get(item.ejercicioId()), item.seriesObjetivo(), item.repeticionesObjetivo());
        }
    }
}
