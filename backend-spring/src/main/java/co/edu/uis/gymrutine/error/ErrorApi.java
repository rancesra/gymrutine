package co.edu.uis.gymrutine.error;

import java.util.Map;

/**
 * Error previsto por el contrato. Se lanza desde cualquier parte del código, por ejemplo:
 * {@code throw new ErrorApi(CodigoError.EMAIL_YA_REGISTRADO, "Ya existe una cuenta con este email");}
 * y {@link ManejadorGlobalErrores} lo convierte en la respuesta {codigo, mensaje, campos}.
 */
public class ErrorApi extends RuntimeException {

    private final CodigoError codigo;
    private final Map<String, String> campos;

    public ErrorApi(CodigoError codigo, String mensaje) {
        this(codigo, mensaje, Map.of());
    }

    /** Con {@code campos}: qué campo falló y por qué, para mostrarlo junto a ese campo del formulario. */
    public ErrorApi(CodigoError codigo, String mensaje, Map<String, String> campos) {
        super(mensaje);
        this.codigo = codigo;
        this.campos = Map.copyOf(campos);
    }

    public CodigoError getCodigo() {
        return codigo;
    }

    public Map<String, String> getCampos() {
        return campos;
    }
}