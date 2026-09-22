package co.edu.uis.gymrutine.dto;

import co.edu.uis.gymrutine.model.Objetivo;
import co.edu.uis.gymrutine.model.Usuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Cuerpo de {@code POST /api/auth/registro} (contrato §3). */
public record RegistroRequest(
        @NotBlank(message = "Debe tener entre 2 y 80 caracteres")
        @Size(min = 2, max = 80, message = "Debe tener entre 2 y 80 caracteres")
        String nombre,

        @NotBlank(message = "Escribe un email válido")
        @Email(message = "Escribe un email válido")
        @Size(max = 120, message = "Escribe un email válido")
        String email,

        @NotBlank(message = "Debe tener entre 8 y 72 caracteres")
        @Size(min = 8, max = 72, message = "Debe tener entre 8 y 72 caracteres")
        String contrasena,

        @NotNull(message = "Elige un objetivo")
        Objetivo objetivo) {

    /** Limpia los datos antes de validarlos: el nombre sin espacios alrededor y el email normalizado. */
    public RegistroRequest {
        nombre = nombre == null ? null : nombre.strip();
        email = email == null ? null : Usuario.normalizarEmail(email);
    }
}