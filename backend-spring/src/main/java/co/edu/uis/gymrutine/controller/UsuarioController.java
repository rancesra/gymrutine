package co.edu.uis.gymrutine.controller;

import co.edu.uis.gymrutine.dto.ActualizarPerfilRequest;
import co.edu.uis.gymrutine.dto.UsuarioResponse;
import co.edu.uis.gymrutine.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Perfil del usuario autenticado (contrato §3). {@code GET} también es la puerta del servicio de
 * entrenamiento: lo llama en cada petición para validar el token.
 */
@RestController
@RequestMapping("/api/usuarios/me")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public UsuarioResponse obtener(@RequestAttribute("usuarioId") Long usuarioId) {
        return usuarioService.obtener(usuarioId);
    }

    @PutMapping
    public UsuarioResponse actualizar(@RequestAttribute("usuarioId") Long usuarioId,
            @Valid @RequestBody ActualizarPerfilRequest datos) {
        return usuarioService.actualizarPerfil(usuarioId, datos);
    }
}