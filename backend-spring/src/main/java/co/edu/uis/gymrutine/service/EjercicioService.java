package co.edu.uis.gymrutine.service;

import co.edu.uis.gymrutine.dto.EjercicioResponse;
import co.edu.uis.gymrutine.model.Equipo;
import co.edu.uis.gymrutine.model.GrupoMuscular;
import co.edu.uis.gymrutine.model.Objetivo;
import co.edu.uis.gymrutine.repository.EjercicioRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** El catálogo de ejercicios (historia H5, regla R1). */
@Service
public class EjercicioService {

    private final EjercicioRepository ejercicioRepository;

    public EjercicioService(EjercicioRepository ejercicioRepository) {
        this.ejercicioRepository = ejercicioRepository;
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
}
