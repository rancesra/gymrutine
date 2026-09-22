package co.edu.uis.gymrutine.controller;

import co.edu.uis.gymrutine.dto.ReferenciasResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * {@code GET /api/referencias} (contrato §4). Es pública: el formulario de registro la necesita
 * antes de que el usuario inicie sesión.
 */
@RestController
@RequestMapping("/api/referencias")
public class ReferenciaController {

    @GetMapping
    public ReferenciasResponse listar() {
        return ReferenciasResponse.desdeEnumerados();
    }
}