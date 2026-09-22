package co.edu.uis.gymrutine.repository;

import co.edu.uis.gymrutine.model.TokenAcceso;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/** Acceso a la tabla {@code token_acceso}. */
public interface TokenAccesoRepository extends JpaRepository<TokenAcceso, Long> {

    Optional<TokenAcceso> findByToken(String token);
}