package co.edu.uis.gymrutine.model;

/**
 * Objetivo de entrenamiento del usuario y de cada rutina (MODELO-DATOS §6).
 * Trae su nombre visible y las series y repeticiones que se sugieren al armar una rutina.
 */
public enum Objetivo {

    FUERZA("Fuerza", "Pocas repeticiones con cargas altas", 4, 5),
    PERDIDA_PESO("Pérdida de peso", "Repeticiones moderadas y descansos cortos", 3, 12),
    RESISTENCIA("Resistencia", "Muchas repeticiones con cargas moderadas", 3, 15);

    private final String nombre;
    private final String descripcion;
    private final int seriesSugeridas;
    private final int repeticionesSugeridas;

    Objetivo(String nombre, String descripcion, int seriesSugeridas, int repeticionesSugeridas) {
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.seriesSugeridas = seriesSugeridas;
        this.repeticionesSugeridas = repeticionesSugeridas;
    }

    public String getNombre() {
        return nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public int getSeriesSugeridas() {
        return seriesSugeridas;
    }

    public int getRepeticionesSugeridas() {
        return repeticionesSugeridas;
    }
}