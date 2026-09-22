package co.edu.uis.gymrutine.dto;

import co.edu.uis.gymrutine.model.Usuario;
import jakarta.validation.constraints.NotBlank;

/** Cuerpo de {@code POST /api/auth/login} (contrato §3). */
public record LoginRequest(
        @NotBlank(message = "Es obligatorio")
        String email,

        @NotBlank(message = "Es obligatoria")
        String contrasena) {

    /** El email se busca normalizado, igual que se guardó al registrarse. */
    public LoginRequest {
        email = email == null ? null : Usuario.normalizarEmail(email);
    }
}