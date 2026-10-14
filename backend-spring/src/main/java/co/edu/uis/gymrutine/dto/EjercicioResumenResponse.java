package co.edu.uis.gymrutine.dto;

import co.edu.uis.gymrutine.model.Ejercicio;
import co.edu.uis.gymrutine.model.Equipo;
import co.edu.uis.gymrutine.model.GrupoMuscular;

/**
 * Lo mínimo de un ejercicio para mostrarlo dentro de otra respuesta, como el detalle de una rutina
 * (contrato §6). Lo comparten el catálogo y las rutinas.
 */
public record EjercicioResumenResponse(
        Long id,
        String nombre,
        GrupoMuscular grupoMuscular,
        Equipo equipo,
        boolean activo) {

    public static EjercicioResumenResponse desde(Ejercicio ejercicio) {
        return new EjercicioResumenResponse(ejercicio.getId(), ejercicio.getNombre(), ejercicio.getGrupoMuscular(),
                ejercicio.getEquipo(), ejercicio.isActivo());
    }
}
