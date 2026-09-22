package co.edu.uis.gymrutine.config;

import static co.edu.uis.gymrutine.model.Equipo.BARRA;
import static co.edu.uis.gymrutine.model.Equipo.MANCUERNAS;
import static co.edu.uis.gymrutine.model.Equipo.MAQUINA;
import static co.edu.uis.gymrutine.model.Equipo.OTRO;
import static co.edu.uis.gymrutine.model.Equipo.PESO_CORPORAL;
import static co.edu.uis.gymrutine.model.Equipo.POLEA;
import static co.edu.uis.gymrutine.model.GrupoMuscular.ABDOMEN;
import static co.edu.uis.gymrutine.model.GrupoMuscular.BICEPS;
import static co.edu.uis.gymrutine.model.GrupoMuscular.ESPALDA;
import static co.edu.uis.gymrutine.model.GrupoMuscular.GLUTEOS;
import static co.edu.uis.gymrutine.model.GrupoMuscular.HOMBROS;
import static co.edu.uis.gymrutine.model.GrupoMuscular.PECHO;
import static co.edu.uis.gymrutine.model.GrupoMuscular.PIERNAS;
import static co.edu.uis.gymrutine.model.GrupoMuscular.TRICEPS;

import co.edu.uis.gymrutine.model.Ejercicio;
import co.edu.uis.gymrutine.model.Equipo;
import co.edu.uis.gymrutine.model.GrupoMuscular;
import co.edu.uis.gymrutine.model.Objetivo;
import co.edu.uis.gymrutine.repository.EjercicioRepository;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Carga los 40 ejercicios del catálogo base al arrancar (MODELO-DATOS §10).
 * Es idempotente: cada ejercicio se inserta solo si no existe ya uno base con ese nombre,
 * así que arrancar varias veces no crea duplicados.
 */
@Component
public class CargaCatalogoBase implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(CargaCatalogoBase.class);

    /** Un ejercicio del catálogo tal como aparece en la tabla del modelo. */
    private record Semilla(String nombre, GrupoMuscular grupo, Equipo equipo, Set<Objetivo> objetivos) {
    }

    /** En el mismo orden del modelo: en una base vacía, los ids quedan del 1 al 40, como en el contrato. */
    private static final List<Semilla> CATALOGO = List.of(
            semilla("Press de banca con barra", PECHO, BARRA, "F"),
            semilla("Press inclinado con mancuernas", PECHO, MANCUERNAS, "F, P"),
            semilla("Aperturas con mancuernas", PECHO, MANCUERNAS, "P, R"),
            semilla("Cruce de poleas", PECHO, POLEA, "P, R"),
            semilla("Flexiones de pecho", PECHO, PESO_CORPORAL, "P, R"),
            semilla("Peso muerto", ESPALDA, BARRA, "F"),
            semilla("Dominadas", ESPALDA, PESO_CORPORAL, "F, R"),
            semilla("Jalón al pecho", ESPALDA, POLEA, "F, P"),
            semilla("Remo con barra", ESPALDA, BARRA, "F"),
            semilla("Remo con mancuerna a una mano", ESPALDA, MANCUERNAS, "F, P"),
            semilla("Remo sentado en polea", ESPALDA, POLEA, "P, R"),
            semilla("Press militar con barra", HOMBROS, BARRA, "F"),
            semilla("Press de hombro con mancuernas", HOMBROS, MANCUERNAS, "F, P"),
            semilla("Elevaciones laterales", HOMBROS, MANCUERNAS, "P, R"),
            semilla("Elevaciones posteriores", HOMBROS, MANCUERNAS, "R"),
            semilla("Face pull en polea", HOMBROS, POLEA, "R"),
            semilla("Curl con barra", BICEPS, BARRA, "F, P"),
            semilla("Curl alterno con mancuernas", BICEPS, MANCUERNAS, "P, R"),
            semilla("Curl martillo", BICEPS, MANCUERNAS, "P, R"),
            semilla("Curl en polea", BICEPS, POLEA, "R"),
            semilla("Fondos en paralelas", TRICEPS, PESO_CORPORAL, "F, R"),
            semilla("Press francés con barra", TRICEPS, BARRA, "F"),
            semilla("Extensión de tríceps en polea", TRICEPS, POLEA, "P, R"),
            semilla("Patada de tríceps con mancuerna", TRICEPS, MANCUERNAS, "R"),
            semilla("Sentadilla con barra", PIERNAS, BARRA, "F"),
            semilla("Prensa de piernas", PIERNAS, MAQUINA, "F, P"),
            semilla("Zancadas con mancuernas", PIERNAS, MANCUERNAS, "P, R"),
            semilla("Extensión de cuádriceps", PIERNAS, MAQUINA, "P, R"),
            semilla("Curl femoral en máquina", PIERNAS, MAQUINA, "P, R"),
            semilla("Elevación de talones en máquina", PIERNAS, MAQUINA, "R"),
            semilla("Hip thrust con barra", GLUTEOS, BARRA, "F, P"),
            semilla("Peso muerto rumano", GLUTEOS, BARRA, "F"),
            semilla("Sentadilla búlgara", GLUTEOS, MANCUERNAS, "P, R"),
            semilla("Patada de glúteo en polea", GLUTEOS, POLEA, "R"),
            semilla("Swing con kettlebell", GLUTEOS, OTRO, "P, R"),
            semilla("Crunch abdominal", ABDOMEN, PESO_CORPORAL, "R"),
            semilla("Elevación de piernas colgado", ABDOMEN, PESO_CORPORAL, "F, R"),
            semilla("Crunch en polea", ABDOMEN, POLEA, "P, R"),
            semilla("Rueda abdominal", ABDOMEN, OTRO, "R"),
            semilla("Giros rusos con disco", ABDOMEN, OTRO, "P, R"));

    private final EjercicioRepository ejercicios;

    public CargaCatalogoBase(EjercicioRepository ejercicios) {
        this.ejercicios = ejercicios;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        int nuevos = 0;
        for (Semilla semilla : CATALOGO) {
            if (!ejercicios.existsByUsuarioIsNullAndNombreIgnoreCase(semilla.nombre())) {
                ejercicios.save(new Ejercicio(semilla.nombre(), semilla.grupo(), semilla.equipo(),
                        semilla.objetivos(), null, null));
                nuevos++;
            }
        }
        log.info("Catálogo base: {} ejercicios nuevos de {}", nuevos, CATALOGO.size());
    }

    /** Convierte las letras de la tabla del modelo (F, P, R) en objetivos. */
    private static Semilla semilla(String nombre, GrupoMuscular grupo, Equipo equipo, String letras) {
        Set<Objetivo> objetivos = EnumSet.noneOf(Objetivo.class);
        for (String letra : letras.split(",\\s*")) {
            objetivos.add(switch (letra) {
                case "F" -> Objetivo.FUERZA;
                case "P" -> Objetivo.PERDIDA_PESO;
                case "R" -> Objetivo.RESISTENCIA;
                default -> throw new IllegalArgumentException("Objetivo desconocido: " + letra);
            });
        }
        return new Semilla(nombre, grupo, equipo, objetivos);
    }
}