package co.edu.uis.gymrutine.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Un ejercicio dentro de una rutina, con sus series y repeticiones objetivo.
 * Tabla {@code rutina_ejercicio} (MODELO-DATOS §4). Solo lo crea {@link Rutina#agregarEjercicio}.
 */
@Entity
@Table(name = "rutina_ejercicio")
public class RutinaEjercicio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "rutina_id", nullable = false, foreignKey = @ForeignKey(name = "fk_rutina_ejercicio_rutina"))
    private Rutina rutina;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ejercicio_id", nullable = false, foreignKey = @ForeignKey(name = "fk_rutina_ejercicio_ejercicio"))
    private Ejercicio ejercicio;

    @Column(nullable = false)
    private int orden;

    @Column(nullable = false)
    private int seriesObjetivo;

    @Column(nullable = false)
    private int repeticionesObjetivo;

    /** Lo exige JPA. */
    protected RutinaEjercicio() {
    }

    RutinaEjercicio(Rutina rutina, Ejercicio ejercicio, int orden, int seriesObjetivo, int repeticionesObjetivo) {
        this.rutina = rutina;
        this.ejercicio = ejercicio;
        this.orden = orden;
        this.seriesObjetivo = seriesObjetivo;
        this.repeticionesObjetivo = repeticionesObjetivo;
    }

    public Long getId() {
        return id;
    }

    public Rutina getRutina() {
        return rutina;
    }

    public Ejercicio getEjercicio() {
        return ejercicio;
    }

    public int getOrden() {
        return orden;
    }

    public int getSeriesObjetivo() {
        return seriesObjetivo;
    }

    public int getRepeticionesObjetivo() {
        return repeticionesObjetivo;
    }
}