package co.edu.uis.gymrutine.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import co.edu.uis.gymrutine.model.Ejercicio;
import co.edu.uis.gymrutine.model.Equipo;
import co.edu.uis.gymrutine.model.GrupoMuscular;
import co.edu.uis.gymrutine.model.Objetivo;
import co.edu.uis.gymrutine.model.Usuario;
import co.edu.uis.gymrutine.repository.EjercicioRepository;
import co.edu.uis.gymrutine.repository.UsuarioRepository;
import com.jayway.jsonpath.JsonPath;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

/**
 * Los casos de "Cómo verificar" de T6 contra el contrato (§6). Usa la base de MySQL, como el resto de
 * la aplicación; cada prueba corre en una transacción que se deshace al terminar, así que no deja datos.
 */
@SpringBootTest
@Transactional
class RutinaControllerTest {

    @Autowired
    private WebApplicationContext contexto;

    @Autowired
    private EjercicioRepository ejercicioRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    private MockMvc mvc;
    private String token;
    private List<Long> base;

    @BeforeEach
    void preparar() throws Exception {
        mvc = MockMvcBuilders.webAppContextSetup(contexto).build();
        token = registrarUsuario();
        base = ejercicioRepository.findAll().stream()
                .filter(Ejercicio::esBase)
                .map(Ejercicio::getId)
                .sorted()
                .limit(4)
                .toList();
    }

    @Test
    void crearConTresEjerciciosLosOrdenaSegunElArreglo() throws Exception {
        enviar(post("/api/rutinas"), cuerpo("Pecho y tríceps", base.get(2), base.get(0), base.get(1)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.nombre").value("Pecho y tríceps"))
                .andExpect(jsonPath("$.objetivo").value("FUERZA"))
                .andExpect(jsonPath("$.activa").value(true))
                .andExpect(jsonPath("$.ejercicios", hasSize(3)))
                .andExpect(jsonPath("$.ejercicios[0].orden").value(1))
                .andExpect(jsonPath("$.ejercicios[0].ejercicio.id").value(base.get(2)))
                .andExpect(jsonPath("$.ejercicios[0].ejercicio.activo").value(true))
                .andExpect(jsonPath("$.ejercicios[0].seriesObjetivo").value(4))
                .andExpect(jsonPath("$.ejercicios[0].repeticionesObjetivo").value(5))
                .andExpect(jsonPath("$.ejercicios[1].orden").value(2))
                .andExpect(jsonPath("$.ejercicios[1].ejercicio.id").value(base.get(0)))
                .andExpect(jsonPath("$.ejercicios[2].orden").value(3))
                .andExpect(jsonPath("$.ejercicios[2].ejercicio.id").value(base.get(1)));
    }

    @Test
    void unEjercicioRepetidoEsValidacionFallida() throws Exception {
        enviar(post("/api/rutinas"), cuerpo("Repetida", base.get(0), base.get(0)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("VALIDACION_FALLIDA"))
                .andExpect(jsonPath("$.campos['ejercicios[1].ejercicioId']").exists());
    }

    @Test
    void onceSeriesEsValidacionFallida() throws Exception {
        String cuerpo = """
                {"nombre": "Demasiadas series", "objetivo": "FUERZA",
                 "ejercicios": [{"ejercicioId": %d, "seriesObjetivo": 11, "repeticionesObjetivo": 5}]}
                """.formatted(base.get(0));
        enviar(post("/api/rutinas"), cuerpo)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("VALIDACION_FALLIDA"))
                .andExpect(jsonPath("$.campos['ejercicios[0].seriesObjetivo']").exists());
    }

    @Test
    void sinEjerciciosOConNombreCortoEsValidacionFallida() throws Exception {
        enviar(post("/api/rutinas"), "{\"nombre\": \"ab\", \"objetivo\": \"FUERZA\", \"ejercicios\": []}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.nombre").exists())
                .andExpect(jsonPath("$.campos.ejercicios").exists());
    }

    @Test
    void unEjercicioAjenoInexistenteOEliminadoEsValidacionFallida() throws Exception {
        Usuario otro = usuarioRepository.save(new Usuario("Otra persona", correoNuevo(), "x".repeat(60), Objetivo.FUERZA));
        Ejercicio ajeno = ejercicioRepository.save(new Ejercicio("Ejercicio ajeno " + UUID.randomUUID(),
                GrupoMuscular.PECHO, Equipo.OTRO, Set.of(Objetivo.FUERZA), null, otro));
        Usuario yo = usuarioRepository.findById(usuarioIdDelToken()).orElseThrow();
        Ejercicio eliminado = new Ejercicio("Ejercicio eliminado " + UUID.randomUUID(),
                GrupoMuscular.PECHO, Equipo.OTRO, Set.of(Objetivo.FUERZA), null, yo);
        eliminado.desactivar();
        eliminado = ejercicioRepository.save(eliminado);

        enviar(post("/api/rutinas"), cuerpo("Con errores", base.get(0), ajeno.getId(), 999_999_999L, eliminado.getId()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("VALIDACION_FALLIDA"))
                .andExpect(jsonPath("$.campos['ejercicios[0].ejercicioId']").doesNotExist())
                .andExpect(jsonPath("$.campos['ejercicios[1].ejercicioId']").exists())
                .andExpect(jsonPath("$.campos['ejercicios[2].ejercicioId']").exists())
                .andExpect(jsonPath("$.campos['ejercicios[3].ejercicioId']").exists());
    }

    @Test
    void editarQuitandoUnoYReordenandoDevuelveExactamenteLaLista() throws Exception {
        long id = crearRutina("Para editar", base.get(0), base.get(1), base.get(2));

        enviar(put("/api/rutinas/" + id), cuerpo("Editada", base.get(2), base.get(0)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Editada"))
                .andExpect(jsonPath("$.ejercicios", hasSize(2)))
                .andExpect(jsonPath("$.ejercicios[0].orden").value(1))
                .andExpect(jsonPath("$.ejercicios[0].ejercicio.id").value(base.get(2)))
                .andExpect(jsonPath("$.ejercicios[1].orden").value(2))
                .andExpect(jsonPath("$.ejercicios[1].ejercicio.id").value(base.get(0)));

        enviar(get("/api/rutinas/" + id), null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ejercicios", hasSize(2)))
                .andExpect(jsonPath("$.ejercicios[0].ejercicio.id").value(base.get(2)));
    }

    @Test
    void eliminarLaSacaDeLaListaPeroSigueEnElDetalle() throws Exception {
        long id = crearRutina("Para eliminar", base.get(0));
        crearRutina("Otra que queda", base.get(1));

        enviar(delete("/api/rutinas/" + id), null).andExpect(status().isNoContent());
        enviar(delete("/api/rutinas/" + id), null).andExpect(status().isNoContent());

        enviar(get("/api/rutinas"), null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].nombre").value("Otra que queda"))
                .andExpect(jsonPath("$[0].cantidadEjercicios").value(1));
        enviar(get("/api/rutinas/" + id), null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activa").value(false));
        enviar(put("/api/rutinas/" + id), cuerpo("No se puede", base.get(0)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.codigo").value("RUTINA_NO_ENCONTRADA"));
    }

    @Test
    void laListaVaPorNombre() throws Exception {
        crearRutina("Pierna", base.get(0));
        crearRutina("Espalda", base.get(1), base.get(2));

        enviar(get("/api/rutinas"), null)
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].nombre").value("Espalda"))
                .andExpect(jsonPath("$[0].cantidadEjercicios").value(2))
                .andExpect(jsonPath("$[1].nombre").value("Pierna"));
    }

    @Test
    void unaRutinaDeOtroUsuarioNoExiste() throws Exception {
        long id = crearRutina("De otra persona", base.get(0));
        token = registrarUsuario();

        enviar(get("/api/rutinas/" + id), null)
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.codigo").value("RUTINA_NO_ENCONTRADA"));
        enviar(put("/api/rutinas/" + id), cuerpo("Ajena", base.get(0))).andExpect(status().isNotFound());
        enviar(delete("/api/rutinas/" + id), null).andExpect(status().isNotFound());
        enviar(get("/api/rutinas"), null).andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void sinTokenNoAutenticado() throws Exception {
        mvc.perform(get("/api/rutinas"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.codigo").value("NO_AUTENTICADO"));
    }

    private String registrarUsuario() throws Exception {
        String respuesta = mvc.perform(post("/api/auth/registro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nombre": "Prueba Rutinas", "email": "%s", "contrasena": "clave-segura-1", "objetivo": "FUERZA"}
                                """.formatted(correoNuevo())))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(respuesta, "$.token");
    }

    private Long usuarioIdDelToken() throws Exception {
        String respuesta = enviar(get("/api/usuarios/me"), null).andReturn().getResponse().getContentAsString();
        return ((Number) JsonPath.read(respuesta, "$.id")).longValue();
    }

    private long crearRutina(String nombre, Long... ejercicioIds) throws Exception {
        String respuesta = enviar(post("/api/rutinas"), cuerpo(nombre, ejercicioIds))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
        return ((Number) JsonPath.read(respuesta, "$.id")).longValue();
    }

    private ResultActions enviar(
            MockHttpServletRequestBuilder peticion, String cuerpo)
            throws Exception {
        peticion.header(HttpHeaders.AUTHORIZATION, "Bearer " + token);
        if (cuerpo != null) {
            peticion.contentType(MediaType.APPLICATION_JSON).content(cuerpo);
        }
        return mvc.perform(peticion);
    }

    /** Una rutina de fuerza con 4 × 5 en cada ejercicio, en el orden recibido. */
    private static String cuerpo(String nombre, Long... ejercicioIds) {
        StringBuilder ejercicios = new StringBuilder();
        for (Long ejercicioId : ejercicioIds) {
            if (!ejercicios.isEmpty()) {
                ejercicios.append(", ");
            }
            ejercicios.append("{\"ejercicioId\": %d, \"seriesObjetivo\": 4, \"repeticionesObjetivo\": 5}".formatted(ejercicioId));
        }
        return "{\"nombre\": \"%s\", \"objetivo\": \"FUERZA\", \"ejercicios\": [%s]}".formatted(nombre, ejercicios);
    }

    private static String correoNuevo() {
        return "prueba-" + UUID.randomUUID() + "@gymrutine.test";
    }
}
