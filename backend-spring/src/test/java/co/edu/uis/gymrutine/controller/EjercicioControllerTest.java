package co.edu.uis.gymrutine.controller;

import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.not;
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
 * El CRUD de {@code /api/ejercicios} contra el contrato (§5) y los casos de T5. Usa la base de MySQL;
 * cada prueba corre en una transacción que se deshace al terminar.
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
        token = registrar(email);
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

    @Test
    void crearUnPropioLoDevuelveYSoloLoVeSuDueno() throws Exception {
        String nombre = "Press en máquina Smith " + UUID.randomUUID();
        long id = crear(nombre);

        enviar(get("/api/ejercicios/" + id), null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value(nombre))
                .andExpect(jsonPath("$.objetivos[0]").value("FUERZA"))
                .andExpect(jsonPath("$.objetivos[1]").value("PERDIDA_PESO"))
                .andExpect(jsonPath("$.descripcion").doesNotExist())
                .andExpect(jsonPath("$.propio").value(true))
                .andExpect(jsonPath("$.activo").value(true));

        token = registrar(correoNuevo());
        enviar(get("/api/ejercicios/" + id), null)
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.codigo").value("EJERCICIO_NO_ENCONTRADO"));
        enviar(put("/api/ejercicios/" + id), cuerpo("Ajeno " + UUID.randomUUID())).andExpect(status().isNotFound());
        enviar(delete("/api/ejercicios/" + id), null).andExpect(status().isNotFound());
    }

    @Test
    void unNombreDelCatalogoBaseOPropioRepetidoEsDuplicado() throws Exception {
        enviar(post("/api/ejercicios"), cuerpo("  press de banca con barra "))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.codigo").value("EJERCICIO_DUPLICADO"));

        String nombre = "Propio " + UUID.randomUUID();
        crear(nombre);
        enviar(post("/api/ejercicios"), cuerpo(nombre.toUpperCase())).andExpect(status().isConflict());
    }

    @Test
    void camposInvalidosSonValidacionFallida() throws Exception {
        enviar(post("/api/ejercicios"), """
                {"nombre": "ab", "grupoMuscular": "PECHO", "equipo": null, "objetivos": [], "descripcion": "%s"}
                """.formatted("x".repeat(501)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("VALIDACION_FALLIDA"))
                .andExpect(jsonPath("$.campos.nombre").exists())
                .andExpect(jsonPath("$.campos.equipo").exists())
                .andExpect(jsonPath("$.campos.objetivos").exists())
                .andExpect(jsonPath("$.campos.descripcion").exists());
        enviar(post("/api/ejercicios"), """
                {"nombre": "Objetivos repetidos", "grupoMuscular": "PECHO", "equipo": "OTRO", "objetivos": ["FUERZA", "FUERZA"]}
                """)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.objetivos").exists());
    }

    @Test
    void editarUnPropioLoReemplazaYPuedeConservarSuNombre() throws Exception {
        String nombre = "Para editar " + UUID.randomUUID();
        long id = crear(nombre);

        enviar(put("/api/ejercicios/" + id), """
                {"nombre": "%s", "grupoMuscular": "ESPALDA", "equipo": "POLEA", "objetivos": ["RESISTENCIA"], "descripcion": "Con control"}
                """.formatted(nombre))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value(nombre))
                .andExpect(jsonPath("$.grupoMuscular").value("ESPALDA"))
                .andExpect(jsonPath("$.equipo").value("POLEA"))
                .andExpect(jsonPath("$.objetivos", hasSize(1)))
                .andExpect(jsonPath("$.descripcion").value("Con control"));
        enviar(put("/api/ejercicios/" + id), cuerpo("Peso muerto")).andExpect(status().isConflict());
    }

    @Test
    void unEjercicioBaseNoSeEditaNiSeElimina() throws Exception {
        Long baseId = ejercicioRepository.findAll().stream().filter(Ejercicio::esBase).findFirst().orElseThrow().getId();
        enviar(put("/api/ejercicios/" + baseId), cuerpo("Otro nombre " + UUID.randomUUID()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.codigo").value("EJERCICIO_NO_EDITABLE"));
        enviar(delete("/api/ejercicios/" + baseId), null).andExpect(status().isForbidden());
    }

    @Test
    void eliminarDosVecesRespondeIgualYSigueEnElDetalle() throws Exception {
        String nombre = "Para eliminar " + UUID.randomUUID();
        long id = crear(nombre);

        enviar(delete("/api/ejercicios/" + id), null).andExpect(status().isNoContent());
        enviar(delete("/api/ejercicios/" + id), null).andExpect(status().isNoContent());

        listar("").andExpect(jsonPath("$[*].nombre", not(hasItem(nombre))));
        enviar(get("/api/ejercicios/" + id), null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activo").value(false));
        enviar(put("/api/ejercicios/" + id), cuerpo(nombre)).andExpect(status().isNotFound());
        // Ya eliminado, su nombre queda libre para un ejercicio nuevo
        crear(nombre);
    }

    @Test
    void unIdQueNoExisteEsNoEncontrado() throws Exception {
        enviar(get("/api/ejercicios/999999999"), null)
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.codigo").value("EJERCICIO_NO_ENCONTRADO"));
    }

    private ResultActions listar(String consulta) throws Exception {
        return enviar(get("/api/ejercicios" + consulta), null);
    }

    private ResultActions enviar(MockHttpServletRequestBuilder peticion, String cuerpo) throws Exception {
        peticion.header(HttpHeaders.AUTHORIZATION, "Bearer " + token);
        if (cuerpo != null) {
            peticion.contentType(MediaType.APPLICATION_JSON).content(cuerpo);
        }
        return mvc.perform(peticion);
    }

    private String registrar(String email) throws Exception {
        String respuesta = mvc.perform(post("/api/auth/registro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nombre": "Prueba Catalogo", "email": "%s", "contrasena": "clave-segura-1", "objetivo": "FUERZA"}
                                """.formatted(email)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(respuesta, "$.token");
    }

    private long crear(String nombre) throws Exception {
        String respuesta = enviar(post("/api/ejercicios"), cuerpo(nombre))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
        return ((Number) JsonPath.read(respuesta, "$.id")).longValue();
    }

    /** Un ejercicio de pecho en máquina, para pérdida de peso y fuerza, con la descripción en blanco. */
    private static String cuerpo(String nombre) {
        return """
                {"nombre": "%s", "grupoMuscular": "PECHO", "equipo": "MAQUINA", "objetivos": ["PERDIDA_PESO", "FUERZA"], "descripcion": "  "}
                """.formatted(nombre);
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
