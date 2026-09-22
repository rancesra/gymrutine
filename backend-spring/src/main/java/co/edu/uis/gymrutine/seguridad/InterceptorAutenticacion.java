package co.edu.uis.gymrutine.seguridad;

import co.edu.uis.gymrutine.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Revisa el token antes de que la petición llegue al controller. Si es válido, deja en la petición
 * el id del usuario ({@code usuarioId}) y el token; si no, {@link AuthService} responde 401.
 * Qué rutas protege se decide en {@code ConfiguracionWeb}.
 */
@Component
public class InterceptorAutenticacion implements HandlerInterceptor {

    private static final String PREFIJO = "Bearer ";

    private final AuthService authService;

    public InterceptorAutenticacion(AuthService authService) {
        this.authService = authService;
    }

    @Override
    public boolean preHandle(HttpServletRequest peticion, HttpServletResponse respuesta, Object controlador) {
        String cabecera = peticion.getHeader(HttpHeaders.AUTHORIZATION);
        // Sin cabecera, o sin "Bearer ", se valida un token vacío: no existe y responde 401
        String token = cabecera != null && cabecera.startsWith(PREFIJO) ? cabecera.substring(PREFIJO.length()).strip() : "";
        peticion.setAttribute("usuarioId", authService.usuarioIdDelToken(token));
        peticion.setAttribute("token", token);
        return true;
    }
}