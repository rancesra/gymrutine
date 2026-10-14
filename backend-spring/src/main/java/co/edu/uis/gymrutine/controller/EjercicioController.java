package co.edu.uis.gymrutine.controller;

import co.edu.uis.gymrutine.dto.EjercicioResponse;
import co.edu.uis.gymrutine.model.Equipo;
import co.edu.uis.gymrutine.model.GrupoMuscular;
import co.edu.uis.gymrutine.model.Objetivo;
import co.edu.uis.gymrutine.service.EjercicioService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Catálogo de ejercicios (contrato §5). Un código que no existe en un filtro, como
 * {@code ?grupoMuscular=VOLAR}, responde 400 desde el manejador global.
 */
@RestController
@RequestMapping("/api/ejercicios")
public class EjercicioController {

    private final EjercicioService ejercicioService;

    public EjercicioController(EjercicioService ejercicioService) {
        this.ejercicioService = ejercicioService;
    }

    @GetMapping
    public List<EjercicioResponse> listar(@RequestAttribute("usuarioId") Long usuarioId,
            @RequestParam(required = false) GrupoMuscular grupoMuscular,
            @RequestParam(required = false) Equipo equipo,
            @RequestParam(required = false) Objetivo objetivo,
            @RequestParam(defaultValue = "false") boolean soloPropios) {
        return ejercicioService.listar(usuarioId, grupoMuscular, equipo, objetivo, soloPropios);
    }
}
