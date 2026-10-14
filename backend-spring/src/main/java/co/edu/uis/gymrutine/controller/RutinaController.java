package co.edu.uis.gymrutine.controller;

import co.edu.uis.gymrutine.dto.RutinaRequest;
import co.edu.uis.gymrutine.dto.RutinaResponse;
import co.edu.uis.gymrutine.dto.RutinaResumenResponse;
import co.edu.uis.gymrutine.service.RutinaService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * CRUD de rutinas (contrato §6). {@code GET /{id}} también lo llama el servicio de entrenamiento,
 * con el token del usuario, para validar las sesiones.
 */
@RestController
@RequestMapping("/api/rutinas")
public class RutinaController {

    private final RutinaService rutinaService;

    public RutinaController(RutinaService rutinaService) {
        this.rutinaService = rutinaService;
    }

    @GetMapping
    public List<RutinaResumenResponse> listar(@RequestAttribute("usuarioId") Long usuarioId) {
        return rutinaService.listar(usuarioId);
    }

    @GetMapping("/{id}")
    public RutinaResponse obtener(@RequestAttribute("usuarioId") Long usuarioId, @PathVariable Long id) {
        return rutinaService.obtener(usuarioId, id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RutinaResponse crear(@RequestAttribute("usuarioId") Long usuarioId,
            @Valid @RequestBody RutinaRequest datos) {
        return rutinaService.crear(usuarioId, datos);
    }

    @PutMapping("/{id}")
    public RutinaResponse actualizar(@RequestAttribute("usuarioId") Long usuarioId, @PathVariable Long id,
            @Valid @RequestBody RutinaRequest datos) {
        return rutinaService.actualizar(usuarioId, id, datos);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@RequestAttribute("usuarioId") Long usuarioId, @PathVariable Long id) {
        rutinaService.eliminar(usuarioId, id);
    }
}
