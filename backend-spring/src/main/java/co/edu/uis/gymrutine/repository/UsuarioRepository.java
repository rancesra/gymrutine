package co.edu.uis.gymrutine.repository;

import co.edu.uis.gymrutine.model.Usuario;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/** Acceso a la tabla {@code usuario}. Spring Data escribe las consultas a partir del nombre del método. */
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

    boolean existsByEmail(String email);
}