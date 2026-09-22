package co.edu.uis.gymrutine.error;

import org.springframework.http.HttpStatus;

/**
 * Códigos de error del servicio de cuentas, con su estado HTTP (contrato §10).
 * El frontend decide qué hacer según el código, nunca leyendo el mensaje.
 */
public enum CodigoError {

    VALIDACION_FALLIDA(HttpStatus.BAD_REQUEST),
    NO_AUTENTICADO(HttpStatus.UNAUTHORIZED),
    CREDENCIALES_INVALIDAS(HttpStatus.UNAUTHORIZED),
    EJERCICIO_NO_EDITABLE(HttpStatus.FORBIDDEN),
    EJERCICIO_NO_ENCONTRADO(HttpStatus.NOT_FOUND),
    RUTINA_NO_ENCONTRADA(HttpStatus.NOT_FOUND),
    EMAIL_YA_REGISTRADO(HttpStatus.CONFLICT),
    EJERCICIO_DUPLICADO(HttpStatus.CONFLICT);

    private final HttpStatus estado;

    CodigoError(HttpStatus estado) {
        this.estado = estado;
    }

    public HttpStatus getEstado() {
        return estado;
    }
}