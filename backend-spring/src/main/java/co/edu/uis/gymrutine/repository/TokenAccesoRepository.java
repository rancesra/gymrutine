package co.edu.uis.gymrutine.repository;

import co.edu.uis.gymrutine.model.TokenAcceso;
import co.edu.uis.gymrutine.model.Usuario;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/** Acceso a la tabla {@code token_acceso}. */
public interface TokenAccesoRepository extends JpaRepository<TokenAcceso, Long> {

    Optional<TokenAcceso> findByToken(String token);

    /** Cerrar sesión (regla R9). */
    void deleteByToken(String token);

    /** Limpieza al iniciar sesión: los tokens del usuario que ya vencieron (regla R9). */
    void deleteByUsuarioAndFechaExpiracionBefore(Usuario usuario, LocalDateTime fecha);
}