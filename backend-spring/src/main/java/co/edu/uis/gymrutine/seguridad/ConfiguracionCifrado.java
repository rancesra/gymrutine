package co.edu.uis.gymrutine.seguridad;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Cifrado de contraseñas con BCrypt (ARQUITECTURA DEC-07). Solo usa {@code spring-security-crypto}:
 * no activa Spring Security.
 */
@Configuration
public class ConfiguracionCifrado {

    @Bean
    public PasswordEncoder codificadorContrasenas() {
        return new BCryptPasswordEncoder();
    }
}