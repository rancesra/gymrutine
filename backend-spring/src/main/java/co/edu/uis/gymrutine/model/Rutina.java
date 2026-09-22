package co.edu.uis.gymrutine.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Plan de entrenamiento de un usuario. Tabla {@code rutina} (MODELO-DATOS §4).
 * Sus ejercicios, con series y repeticiones objetivo, viven en {@link RutinaEjercicio}.
 */
@Entity
@Table(name = "rutina")
public class Rutina {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false, foreignKey = @ForeignKey(name = "fk_rutina_usuario"))
    private Usuario usuario;

    @Column(nullable = false, length = 80)
    private String nombre;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "VARCHAR(20)")
    private Objetivo objetivo;

    @Column(nullable = false, columnDefinition = "BOOLEAN")
    private boolean activa;

    @Column(nullable = false)
    private LocalDateTime fechaCreacion;

    /**
     * Los ejercicios se guardan y se borran junto con la rutina: al quitar uno de la lista,
     * {@code orphanRemoval} borra su fila.
     */
    @OneToMany(mappedBy = "rutina", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orden ASC")
    private List<RutinaEjercicio> ejercicios = new ArrayList<>();

    /** Lo exige JPA; el código de la aplicación usa el otro constructor. */
    protected Rutina() {
    }

    public Rutina(Usuario usuario, String nombre, Objetivo objetivo) {
        this.usuario = usuario;
        this.nombre = nombre;
        this.objetivo = objetivo;
        this.activa = true;
        this.fechaCreacion = LocalDateTime.now();
    }

    /** Agrega un ejercicio al final: su orden es la posición en la lista (1, 2, 3…). */
    public void agregarEjercicio(Ejercicio ejercicio, int seriesObjetivo, int repeticionesObjetivo) {
        ejercicios.add(new RutinaEjercicio(this, ejercicio, ejercicios.size() + 1, seriesObjetivo, repeticionesObjetivo));
    }

    /** Cambia el nombre y el objetivo, y vacía la lista para volver a llenarla (PUT, historia H12). */
    public void actualizar(String nombre, Objetivo objetivo) {
        this.nombre = nombre;
        this.objetivo = objetivo;
        this.ejercicios.clear();
    }

    /** Borrado lógico (regla R3): deja de listarse, pero su nombre sigue en el historial. */
    public void desactivar() {
        this.activa = false;
    }

    public Long getId() {
        return id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public String getNombre() {
        return nombre;
    }

    public Objetivo getObjetivo() {
        return objetivo;
    }

    public boolean isActiva() {
        return activa;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public List<RutinaEjercicio> getEjercicios() {
        return Collections.unmodifiableList(ejercicios);
    }
}