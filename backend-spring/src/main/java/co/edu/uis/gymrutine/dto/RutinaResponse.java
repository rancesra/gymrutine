package co.edu.uis.gymrutine.dto;

import co.edu.uis.gymrutine.model.Objetivo;
import co.edu.uis.gymrutine.model.Rutina;
import co.edu.uis.gymrutine.model.RutinaEjercicio;
import java.util.List;

/**
 * Detalle de una rutina con sus ejercicios en orden (contrato §6). Lo devuelven {@code GET /{id}},
 * {@code POST} y {@code PUT}; el servicio de entrenamiento lo usa para validar las sesiones.
 */
public record RutinaResponse(
        Long id,
        String nombre,
        Objetivo objetivo,
        boolean activa,
        List<RutinaEjercicioResponse> ejercicios) {

    /** Un ejercicio de la rutina con sus series y repeticiones objetivo. */
    public record RutinaEjercicioResponse(
            int orden,
            EjercicioResumenResponse ejercicio,
            int seriesObjetivo,
            int repeticionesObjetivo) {

        public static RutinaEjercicioResponse desde(RutinaEjercicio rutinaEjercicio) {
            return new RutinaEjercicioResponse(rutinaEjercicio.getOrden(),
                    EjercicioResumenResponse.desde(rutinaEjercicio.getEjercicio()),
                    rutinaEjercicio.getSeriesObjetivo(), rutinaEjercicio.getRepeticionesObjetivo());
        }
    }

    public static RutinaResponse desde(Rutina rutina) {
        return new RutinaResponse(rutina.getId(), rutina.getNombre(), rutina.getObjetivo(), rutina.isActiva(),
                rutina.getEjercicios().stream().map(RutinaEjercicioResponse::desde).toList());
    }
}
