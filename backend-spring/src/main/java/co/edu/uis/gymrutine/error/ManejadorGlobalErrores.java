package co.edu.uis.gymrutine.error;

import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

/**
 * Convierte los errores en la respuesta {codigo, mensaje, campos} del contrato (§10), para que el
 * frontend maneje igual los errores de los dos servicios.
 */
@RestControllerAdvice
public class ManejadorGlobalErrores {

    /** Los errores previstos que lanza el propio código: 401, 403, 404, 409… */
    @ExceptionHandler(ErrorApi.class)
    public ResponseEntity<ErrorResponse> errorApi(ErrorApi error) {
        return responder(error.getCodigo(), error.getMessage(), error.getCampos());
    }

    /** Un {@code @Valid} falló: cada campo con su mensaje (el primero, si tiene varios). */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> validacion(MethodArgumentNotValidException error) {
        Map<String, String> campos = new LinkedHashMap<>();
        for (FieldError campo : error.getBindingResult().getFieldErrors()) {
            campos.putIfAbsent(campo.getField(), campo.getDefaultMessage());
        }
        return responder(CodigoError.VALIDACION_FALLIDA, "Hay campos con errores", campos);
    }

    /** El cuerpo no se pudo leer: JSON mal formado o un valor que no existe (por ejemplo, un objetivo inventado). */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> cuerpoIlegible(HttpMessageNotReadableException error) {
        return responder(CodigoError.VALIDACION_FALLIDA, "El cuerpo no es un JSON válido o tiene un valor no permitido", Map.of());
    }

    /** Un parámetro de la URL con un valor que no corresponde, como {@code ?grupoMuscular=VOLAR}. */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> parametroInvalido(MethodArgumentTypeMismatchException error) {
        return responder(CodigoError.VALIDACION_FALLIDA, "Hay campos con errores",
                Map.of(error.getName(), "tiene un valor no válido"));
    }

    private ResponseEntity<ErrorResponse> responder(CodigoError codigo, String mensaje, Map<String, String> campos) {
        return ResponseEntity.status(codigo.getEstado()).body(new ErrorResponse(codigo.name(), mensaje, campos));
    }
}