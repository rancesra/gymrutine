package co.edu.uis.gymrutine.repository;

import co.edu.uis.gymrutine.model.Rutina;
import org.springframework.data.jpa.repository.JpaRepository;

/** Acceso a las tablas {@code rutina} y {@code rutina_ejercicio}. */
public interface RutinaRepository extends JpaRepository<Rutina, Long> {
}