package co.edu.uis.gymrutine.repository;

import co.edu.uis.gymrutine.model.Rutina;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Acceso a las tablas {@code rutina} y {@code rutina_ejercicio}. Toda consulta filtra por el dueño:
 * así una rutina de otro usuario responde igual que una que no existe.
 */
public interface RutinaRepository extends JpaRepository<Rutina, Long> {

    /** Mis rutinas (historia H11): solo las activas, por nombre. */
    List<Rutina> findByUsuarioIdAndActivaTrueOrderByNombreAsc(Long usuarioId);

    /** Una rutina del usuario, activa o eliminada. */
    Optional<Rutina> findByIdAndUsuarioId(Long id, Long usuarioId);
}
