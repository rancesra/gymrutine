package co.edu.uis.gymrutine.repository;

import co.edu.uis.gymrutine.model.Ejercicio;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/** Acceso a las tablas {@code ejercicio} y {@code ejercicio_objetivo}. */
public interface EjercicioRepository extends JpaRepository<Ejercicio, Long> {

    /** ¿Ya hay un ejercicio del catálogo base con ese nombre, sin importar mayúsculas? */
    boolean existsByUsuarioIsNullAndNombreIgnoreCase(String nombre);

    /**
     * Ejercicios visibles y activos (regla R1): los del catálogo base y los propios del usuario, por nombre.
     * Trae los objetivos en la misma consulta para no hacer una por ejercicio.
     */
    @Query("""
            select distinct e from Ejercicio e left join fetch e.objetivos
            where e.activo = true and (e.usuario is null or e.usuario.id = :usuarioId)
            order by e.nombre""")
    List<Ejercicio> buscarVisibles(@Param("usuarioId") Long usuarioId);
}
