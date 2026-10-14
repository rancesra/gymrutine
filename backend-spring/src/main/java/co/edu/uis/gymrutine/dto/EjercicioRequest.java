package co.edu.uis.gymrutine.dto;

import co.edu.uis.gymrutine.model.Equipo;
import co.edu.uis.gymrutine.model.GrupoMuscular;
import co.edu.uis.gymrutine.model.Objetivo;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

/**
 * Cuerpo de {@code POST /api/ejercicios} y de {@code PUT /api/ejercicios/{id}} (contrato §5).
 * {@code id}, {@code propio} y {@code activo} los asigna el servidor: si llegan, se ignoran.
 * Que los objetivos no se repitan lo revisa {@code EjercicioService}.
 */
public record EjercicioRequest(
        @NotBlank(message = "Debe tener entre 3 y 80 caracteres")
        @Size(min = 3, max = 80, message = "Debe tener entre 3 y 80 caracteres")
        String nombre,

        @NotNull(message = "Elige un grupo muscular")
        GrupoMuscular grupoMuscular,

        @NotNull(message = "Elige un equipo")
        Equipo equipo,

        @NotNull(message = "Elige entre 1 y 3 objetivos")
        @Size(min = 1, max = 3, message = "Elige entre 1 y 3 objetivos")
        List<@NotNull(message = "Elige un objetivo") Objetivo> objetivos,

        @Size(max = 500, message = "Máximo 500 caracteres")
        String descripcion) {

    /** El nombre sin espacios alrededor, y una descripción en blanco se guarda como {@code null}. */
    public EjercicioRequest {
        nombre = nombre == null ? null : nombre.strip();
        descripcion = descripcion == null || descripcion.isBlank() ? null : descripcion.strip();
    }
}
