package co.edu.uis.gymrutine.dto;

import co.edu.uis.gymrutine.model.Objetivo;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

/**
 * Cuerpo de {@code POST /api/rutinas} y de {@code PUT /api/rutinas/{id}} (contrato §6).
 * Que los ejercicios no se repitan y que cada uno esté visible y activo lo revisa {@code RutinaService},
 * porque necesita la base de datos.
 */
public record RutinaRequest(
        @NotBlank(message = "Debe tener entre 3 y 80 caracteres")
        @Size(min = 3, max = 80, message = "Debe tener entre 3 y 80 caracteres")
        String nombre,

        @NotNull(message = "Elige un objetivo")
        Objetivo objetivo,

        @NotNull(message = "Agrega entre 1 y 15 ejercicios")
        @Size(min = 1, max = 15, message = "Agrega entre 1 y 15 ejercicios")
        List<@NotNull(message = "Es obligatorio") @Valid EjercicioRutinaRequest> ejercicios) {

    public RutinaRequest {
        nombre = nombre == null ? null : nombre.strip();
    }

    /** Un ejercicio de la rutina. Su orden es su posición en el arreglo. */
    public record EjercicioRutinaRequest(
            @NotNull(message = "Es obligatorio")
            Long ejercicioId,

            @NotNull(message = "Debe estar entre 1 y 10")
            @Min(value = 1, message = "Debe estar entre 1 y 10")
            @Max(value = 10, message = "Debe estar entre 1 y 10")
            Integer seriesObjetivo,

            @NotNull(message = "Debe estar entre 1 y 50")
            @Min(value = 1, message = "Debe estar entre 1 y 50")
            @Max(value = 50, message = "Debe estar entre 1 y 50")
            Integer repeticionesObjetivo) {
    }
}
