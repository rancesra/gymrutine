package co.edu.uis.gymrutine.model;

/**
 * Equipo que necesita un ejercicio (MODELO-DATOS §6).
 */
public enum Equipo {

    BARRA("Barra"),
    MANCUERNAS("Mancuernas"),
    MAQUINA("Máquina"),
    POLEA("Polea"),
    PESO_CORPORAL("Peso corporal"),
    OTRO("Otro");

    private final String nombre;

    Equipo(String nombre) {
        this.nombre = nombre;
    }

    public String getNombre() {
        return nombre;
    }
}