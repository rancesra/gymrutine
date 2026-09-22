package co.edu.uis.gymrutine.dto;

import co.edu.uis.gymrutine.model.Objetivo;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Cuerpo de {@code PUT /api/usuarios/me} (contrato §3). El email y la contraseña no se cambian. */
public record ActualizarPerfilRequest(
        @NotBlank(message = "Debe tener entre 2 y 80 caracteres")
        @Size(min = 2, max = 80, message = "Debe tener entre 2 y 80 caracteres")
        String nombre,

        @NotNull(message = "Elige un objetivo")
        Objetivo objetivo) {

    public ActualizarPerfilRequest {
        nombre = nombre == null ? null : nombre.strip();
    }
}