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

    /**
     * ¿Ya hay un ejercicio base, o uno propio y activo del usuario, con ese nombre sin importar mayúsculas?
     * Al editar, {@code excluirId} es el mismo ejercicio, que no choca consigo mismo; al crear, {@code null}.
     */
    @Query("""
            select count(e) > 0 from Ejercicio e
            where lower(e.nombre) = lower(:nombre)
              and (e.usuario is null or (e.usuario.id = :usuarioId and e.activo = true))
              and (:excluirId is null or e.id <> :excluirId)""")
    boolean existeNombre(@Param("nombre") String nombre, @Param("usuarioId") Long usuarioId,
            @Param("excluirId") Long excluirId);
}
