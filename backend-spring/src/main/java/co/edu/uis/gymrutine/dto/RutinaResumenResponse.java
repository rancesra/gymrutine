package co.edu.uis.gymrutine.dto;

import co.edu.uis.gymrutine.model.Objetivo;
import co.edu.uis.gymrutine.model.Rutina;

/**
 * Una rutina en la lista de {@code GET /api/rutinas} (contrato §6). La última vez que se entrenó no
 * viene aquí: las sesiones viven en el servicio de entrenamiento.
 */
public record RutinaResumenResponse(
        Long id,
        String nombre,
        Objetivo objetivo,
        int cantidadEjercicios) {

    public static RutinaResumenResponse desde(Rutina rutina) {
        return new RutinaResumenResponse(rutina.getId(), rutina.getNombre(), rutina.getObjetivo(),
                rutina.getEjercicios().size());
    }
}
