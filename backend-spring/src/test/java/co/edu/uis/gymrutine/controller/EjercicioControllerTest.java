package co.edu.uis.gymrutine.controller;

import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

/**
 * {@code GET /api/ejercicios} contra el contrato (§5) y los casos de T5. Usa la base de MySQL; cada
 * prueba corre en una transacción que se deshace al terminar.
 */
@SpringBootTest
@Transactional
class EjercicioControllerTest {

    @Autowired
    private WebApplicationContext contexto;

    @Autowired
    private EjercicioRepository ejercicioRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    private MockMvc mvc;
    private String token;
    private Usuario yo;

    @BeforeEach
    void preparar() throws Exception {
        mvc = MockMvcBuilders.webAppContextSetup(contexto).build();
        String email = correoNuevo();
        String respuesta = mvc.perform(post("/api/auth/registro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nombre": "Prueba Catalogo", "email": "%s", "contrasena": "clave-segura-1", "objetivo": "FUERZA"}
                                """.formatted(email)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        token = JsonPath.read(respuesta, "$.token");
        yo = usuarioRepository.findByEmail(email).orElseThrow();
    }

    @Test
    void sinFiltrosTraeLos40BaseConElFormatoDelContrato() throws Exception {
        long base = ejercicioRepository.findAll().stream().filter(e -> e.esBase() && e.isActivo()).count();
        listar("")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize((int) base)))
                .andExpect(jsonPath("$[0].id").isNumber())
                .andExpect(jsonPath("$[0].nombre").isString())
                .andExpect(jsonPath("$[0].objetivos").isArray())
                .andExpect(jsonPath("$[0].propio").value(false))
                .andExpect(jsonPath("$[0].activo").value(true))
                .andExpect(jsonPath("$[?(@.nombre == 'Press de banca con barra')].objetivos[0]").value("FUERZA"));
    }

    @Test
    void incluyeLosPropiosActivosYNoLosAjenosNiLosEliminados() throws Exception {
        String sufijo = UUID.randomUUID().toString();
        ejercicio("Mio " + sufijo, yo, true);
        ejercicio("Eliminado " + sufijo, yo, false);
        Usuario otro = usuarioRepository.save(new Usuario("Otra persona", correoNuevo(), "x".repeat(60), Objetivo.FUERZA));
        ejercicio("Ajeno " + sufijo, otro, true);

        listar("")
                .andExpect(jsonPath("$[*].nombre", hasItem("Mio " + sufijo)))
                .andExpect(jsonPath("$[*].nombre", not(hasItem("Eliminado " + sufijo))))
                .andExpect(jsonPath("$[*].nombre", not(hasItem("Ajeno " + sufijo))));
        listar("?soloPropios=true")
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].nombre").value("Mio " + sufijo))
                .andExpect(jsonPath("$[0].propio").value(true));
    }

    @Test
    void losFiltrosSeCombinan() throws Exception {
        listar("?grupoMuscular=PECHO&objetivo=FUERZA")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[*].grupoMuscular", everyItem(is("PECHO"))))
                .andExpect(jsonPath("$[*].nombre", hasItem("Press de banca con barra")));
        listar("?equipo=MAQUINA")
                .andExpect(jsonPath("$[*].equipo", everyItem(is("MAQUINA"))));
    }

    @Test
    void unCodigoQueNoExisteEsValidacionFallida() throws Exception {
        listar("?grupoMuscular=VOLAR")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("VALIDACION_FALLIDA"));
    }

    @Test
    void sinTokenNoAutenticado() throws Exception {
        mvc.perform(get("/api/ejercicios"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.codigo").value("NO_AUTENTICADO"));
    }

    private ResultActions listar(String consulta) throws Exception {
        return mvc.perform(get("/api/ejercicios" + consulta).header(HttpHeaders.AUTHORIZATION, "Bearer " + token));
    }

    private void ejercicio(String nombre, Usuario usuario, boolean activo) {
        Ejercicio ejercicio = new Ejercicio(nombre, GrupoMuscular.PECHO, Equipo.OTRO, Set.of(Objetivo.FUERZA), null, usuario);
        if (!activo) {
            ejercicio.desactivar();
        }
        ejercicioRepository.save(ejercicio);
    }

    private static String correoNuevo() {
        return "prueba-" + UUID.randomUUID() + "@gymrutine.test";
    }
}
