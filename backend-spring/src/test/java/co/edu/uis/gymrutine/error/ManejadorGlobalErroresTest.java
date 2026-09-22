package co.edu.uis.gymrutine.error;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import co.edu.uis.gymrutine.model.GrupoMuscular;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Comprueba que cada tipo de error sale con el formato {codigo, mensaje, campos} del contrato (§10).
 * No necesita la base de datos: usa un controlador de prueba con el manejador de errores.
 */
class ManejadorGlobalErroresTest {

    record DatosDePrueba(@NotBlank(message = "es obligatorio") @Size(min = 2, message = "debe tener al menos 2 caracteres") String nombre) {
    }

    @RestController
    static class ControladorDePrueba {

        @GetMapping("/prueba/conflicto")
        void conflicto() {
            throw new ErrorApi(CodigoError.EMAIL_YA_REGISTRADO, "Ya existe una cuenta con este email");
        }

        @PostMapping("/prueba/datos")
        void datos(@Valid @RequestBody DatosDePrueba datos) {
        }

        @GetMapping("/prueba/filtro")
        void filtro(@RequestParam GrupoMuscular grupoMuscular) {
        }
    }

    private MockMvc mvc;

    @BeforeEach
    void preparar() {
        mvc = MockMvcBuilders.standaloneSetup(new ControladorDePrueba())
                .setControllerAdvice(new ManejadorGlobalErrores())
                .build();
    }

    @Test
    void unErrorApiSaleConSuEstadoCodigoYMensaje() throws Exception {
        mvc.perform(get("/prueba/conflicto"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.codigo").value("EMAIL_YA_REGISTRADO"))
                .andExpect(jsonPath("$.mensaje").value("Ya existe una cuenta con este email"))
                .andExpect(jsonPath("$.campos").doesNotExist());
    }

    @Test
    void unCampoInvalidoSaleEnCampos() throws Exception {
        mvc.perform(post("/prueba/datos").contentType(MediaType.APPLICATION_JSON).content("{\"nombre\": \"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("VALIDACION_FALLIDA"))
                .andExpect(jsonPath("$.campos.nombre").exists());
    }

    @Test
    void unJsonMalFormadoEsValidacionFallida() throws Exception {
        mvc.perform(post("/prueba/datos").contentType(MediaType.APPLICATION_JSON).content("{\"nombre\": "))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("VALIDACION_FALLIDA"));
    }

    @Test
    void unCodigoQueNoExisteEnLaUrlEsValidacionFallida() throws Exception {
        mvc.perform(get("/prueba/filtro").param("grupoMuscular", "VOLAR"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("VALIDACION_FALLIDA"))
                .andExpect(jsonPath("$.campos.grupoMuscular").value("tiene un valor no válido"));
    }
}