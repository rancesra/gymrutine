package co.edu.uis.gymrutine.dto;

import co.edu.uis.gymrutine.model.Equipo;
import co.edu.uis.gymrutine.model.GrupoMuscular;
import co.edu.uis.gymrutine.model.Objetivo;
import java.util.Arrays;
import java.util.List;

/**
 * Respuesta de {@code GET /api/referencias} (contrato §4): los códigos de los enumerados con su
 * nombre visible, para que el frontend nunca escriba esos textos a mano.
 */
public record ReferenciasResponse(
        List<ObjetivoResponse> objetivos,
        List<OpcionResponse> gruposMusculares,
        List<OpcionResponse> equipos) {

    /** Un objetivo con su nombre y las series y repeticiones que se sugieren. */
    public record ObjetivoResponse(String codigo, String nombre, String descripcion, int seriesSugeridas,
            int repeticionesSugeridas) {

        public static ObjetivoResponse desde(Objetivo objetivo) {
            return new ObjetivoResponse(objetivo.name(), objetivo.getNombre(), objetivo.getDescripcion(),
                    objetivo.getSeriesSugeridas(), objetivo.getRepeticionesSugeridas());
        }
    }

    /** Un grupo muscular o un equipo: el código y el nombre que ve el usuario. */
    public record OpcionResponse(String codigo, String nombre) {
    }

    /** Arma la respuesta con todos los valores, en el orden en que están declarados. */
    public static ReferenciasResponse desdeEnumerados() {
        return new ReferenciasResponse(
                Arrays.stream(Objetivo.values()).map(ObjetivoResponse::desde).toList(),
                Arrays.stream(GrupoMuscular.values()).map(grupo -> new OpcionResponse(grupo.name(), grupo.getNombre())).toList(),
                Arrays.stream(Equipo.values()).map(equipo -> new OpcionResponse(equipo.name(), equipo.getNombre())).toList());
    }
}