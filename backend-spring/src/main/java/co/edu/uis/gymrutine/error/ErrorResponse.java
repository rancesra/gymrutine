package co.edu.uis.gymrutine.error;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.Map;

/**
 * Cuerpo de toda respuesta de error prevista (contrato §10).
 * {@code campos} solo aparece cuando hay errores de campos concretos.
 */
public record ErrorResponse(
        String codigo,
        String mensaje,
        @JsonInclude(JsonInclude.Include.NON_EMPTY) Map<String, String> campos) {
}