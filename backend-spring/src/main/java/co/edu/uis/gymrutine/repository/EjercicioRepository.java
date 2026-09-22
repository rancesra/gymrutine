package co.edu.uis.gymrutine.repository;

import co.edu.uis.gymrutine.model.Ejercicio;
import org.springframework.data.jpa.repository.JpaRepository;

/** Acceso a las tablas {@code ejercicio} y {@code ejercicio_objetivo}. */
public interface EjercicioRepository extends JpaRepository<Ejercicio, Long> {

    /** ¿Ya hay un ejercicio del catálogo base con ese nombre, sin importar mayúsculas? */
    boolean existsByUsuarioIsNullAndNombreIgnoreCase(String nombre);
}