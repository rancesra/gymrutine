package co.edu.uis.gymrutine.model;

/**
 * Grupo muscular que trabaja un ejercicio (MODELO-DATOS §6).
 */
public enum GrupoMuscular {

    PECHO("Pecho"),
    ESPALDA("Espalda"),
    HOMBROS("Hombros"),
    BICEPS("Bíceps"),
    TRICEPS("Tríceps"),
    PIERNAS("Piernas"),
    GLUTEOS("Glúteos"),
    ABDOMEN("Abdomen");

    private final String nombre;

    GrupoMuscular(String nombre) {
        this.nombre = nombre;
    }

    public String getNombre() {
        return nombre;
    }
}