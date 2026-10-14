package co.edu.uis.gymrutine.dto;

import co.edu.uis.gymrutine.model.Ejercicio;
import co.edu.uis.gymrutine.model.Equipo;
import co.edu.uis.gymrutine.model.GrupoMuscular;
import co.edu.uis.gymrutine.model.Objetivo;
import java.util.List;

/** El modelo Ejercicio del contrato (§5). {@code propio} es {@code true} si es del usuario y no del catálogo base. */
public record EjercicioResponse(
        Long id,
        String nombre,
        GrupoMuscular grupoMuscular,
        Equipo equipo,
        List<Objetivo> objetivos,
        String descripcion,
        boolean propio,
        boolean activo) {

    /** Los objetivos salen en el orden de {@code GET /referencias}, no en el de la base. */
    public static EjercicioResponse desde(Ejercicio ejercicio) {
        return new EjercicioResponse(ejercicio.getId(), ejercicio.getNombre(), ejercicio.getGrupoMuscular(),
                ejercicio.getEquipo(), ejercicio.getObjetivos().stream().sorted().toList(), ejercicio.getDescripcion(),
                !ejercicio.esBase(), ejercicio.isActivo());
    }
}
