package co.edu.uis.gymrutine.controller;

import co.edu.uis.gymrutine.dto.LoginRequest;
import co.edu.uis.gymrutine.dto.RegistroRequest;
import co.edu.uis.gymrutine.dto.SesionResponse;
import co.edu.uis.gymrutine.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** Registro, inicio y cierre de sesión (contrato §3). Registro y login son públicos. */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/registro")
    @ResponseStatus(HttpStatus.CREATED)
    public SesionResponse registrar(@Valid @RequestBody RegistroRequest datos) {
        return authService.registrar(datos);
    }

    @PostMapping("/login")
    public SesionResponse iniciarSesion(@Valid @RequestBody LoginRequest datos) {
        return authService.iniciarSesion(datos);
    }

    /** El token lo deja el interceptor en la petición, después de validarlo. */
    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cerrarSesion(@RequestAttribute("token") String token) {
        authService.cerrarSesion(token);
    }
}