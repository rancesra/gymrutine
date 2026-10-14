package co.edu.uis.gymrutine.service;

import co.edu.uis.gymrutine.dto.EjercicioRequest;
import co.edu.uis.gymrutine.dto.EjercicioResponse;
import co.edu.uis.gymrutine.error.CodigoError;
import co.edu.uis.gymrutine.error.ErrorApi;
import co.edu.uis.gymrutine.model.Ejercicio;
import co.edu.uis.gymrutine.model.Equipo;
import co.edu.uis.gymrutine.model.GrupoMuscular;
import co.edu.uis.gymrutine.model.Objetivo;
import co.edu.uis.gymrutine.repository.EjercicioRepository;
import co.edu.uis.gymrutine.repository.UsuarioRepository;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** El catálogo de ejercicios y los ejercicios propios (historias H5 a H9, reglas R1 a R3). */
@Service
public class EjercicioService {

    private final EjercicioRepository ejercicioRepository;
    private final UsuarioRepository usuarioRepository;

    public EjercicioService(EjercicioRepository ejercicioRepository, UsuarioRepository usuarioRepository) {
        this.ejercicioRepository = ejercicioRepository;
        this.usuarioRepository = usuarioRepository;
    }

    /**
     * Los ejercicios visibles y activos que cumplen los filtros; un filtro en {@code null} no filtra.
     * Son unas decenas por usuario, así que se filtran aquí y no en la consulta.
     */
    @Transactional(readOnly = true)
    public List<EjercicioResponse> listar(Long usuarioId, GrupoMuscular grupoMuscular, Equipo equipo,
            Objetivo objetivo, boolean soloPropios) {
        return ejercicioRepository.buscarVisibles(usuarioId).stream()
                .filter(ejercicio -> grupoMuscular == null || ejercicio.getGrupoMuscular() == grupoMuscular)
                .filter(ejercicio -> equipo == null || ejercicio.getEquipo() == equipo)
                .filter(ejercicio -> objetivo == null || ejercicio.getObjetivos().contains(objetivo))
                .filter(ejercicio -> !soloPropios || !ejercicio.esBase())
                .map(EjercicioResponse::desde)
                .toList();
    }

    /** Un propio eliminado también se devuelve, con {@code activo: false}, para mostrarlo en el historial. */
    @Transactional(readOnly = true)
    public EjercicioResponse obtener(Long usuarioId, Long ejercicioId) {
        return EjercicioResponse.desde(buscarVisible(usuarioId, ejercicioId));
    }

    @Transactional
    public EjercicioResponse crear(Long usuarioId, EjercicioRequest datos) {
        Set<Objetivo> objetivos = validarObjetivos(datos.objetivos());
        validarNombreLibre(datos.nombre(), usuarioId, null);
        Ejercicio ejercicio = new Ejercicio(datos.nombre(), datos.grupoMuscular(), datos.equipo(), objetivos,
                datos.descripcion(), usuarioRepository.getReferenceById(usuarioId));
        return EjercicioResponse.desde(ejercicioRepository.save(ejercicio));
    }

    /** Reemplaza el ejercicio completo. Las rutinas que lo usan ven el cambio, porque apuntan a la misma fila. */
    @Transactional
    public EjercicioResponse actualizar(Long usuarioId, Long ejercicioId, EjercicioRequest datos) {
        Ejercicio ejercicio = buscarEditable(usuarioId, ejercicioId);
        if (!ejercicio.isActivo()) {
            throw ejercicioNoEncontrado();
        }
        Set<Objetivo> objetivos = validarObjetivos(datos.objetivos());
        validarNombreLibre(datos.nombre(), usuarioId, ejercicioId);
        ejercicio.actualizar(datos.nombre(), datos.grupoMuscular(), datos.equipo(), objetivos, datos.descripcion());
        return EjercicioResponse.desde(ejercicio);
    }

    /** Borrado lógico (R3). Si ya estaba eliminado no cambia nada, y el controller responde 204 igual. */
    @Transactional
    public void eliminar(Long usuarioId, Long ejercicioId) {
        buscarEditable(usuarioId, ejercicioId).desactivar();
    }

    /** R1: un ejercicio propio de otro usuario responde igual que uno que no existe. */
    private Ejercicio buscarVisible(Long usuarioId, Long ejercicioId) {
        return ejercicioRepository.findById(ejercicioId)
                .filter(ejercicio -> ejercicio.esBase() || ejercicio.getUsuario().getId().equals(usuarioId))
                .orElseThrow(this::ejercicioNoEncontrado);
    }

    /** R2: solo los propios se modifican; uno del catálogo base responde 403. */
    private Ejercicio buscarEditable(Long usuarioId, Long ejercicioId) {
        Ejercicio ejercicio = buscarVisible(usuarioId, ejercicioId);
        if (ejercicio.esBase()) {
            throw new ErrorApi(CodigoError.EJERCICIO_NO_EDITABLE, "Los ejercicios del catálogo base no se pueden modificar");
        }
        return ejercicio;
    }

    private ErrorApi ejercicioNoEncontrado() {
        return new ErrorApi(CodigoError.EJERCICIO_NO_ENCONTRADO, "El ejercicio no existe");
    }

    /** Los objetivos no se repiten (contrato §5). */
    private Set<Objetivo> validarObjetivos(List<Objetivo> lista) {
        Set<Objetivo> objetivos = EnumSet.copyOf(lista);
        if (objetivos.size() != lista.size()) {
            throw new ErrorApi(CodigoError.VALIDACION_FALLIDA, "Hay campos con errores",
                    Map.of("objetivos", "No repitas objetivos"));
        }
        return objetivos;
    }

    private void validarNombreLibre(String nombre, Long usuarioId, Long excluirId) {
        if (ejercicioRepository.existeNombre(nombre, usuarioId, excluirId)) {
            throw new ErrorApi(CodigoError.EJERCICIO_DUPLICADO, "Ya existe un ejercicio con ese nombre");
        }
    }
}
