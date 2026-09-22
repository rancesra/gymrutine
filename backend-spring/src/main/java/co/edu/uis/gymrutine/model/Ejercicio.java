package co.edu.uis.gymrutine.model;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
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
import jakarta.persistence.Table;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

/**
 * Ejercicio del catálogo. Tabla {@code ejercicio} y, para sus objetivos, {@code ejercicio_objetivo}
 * (MODELO-DATOS §4). Sin usuario es del catálogo base, de solo lectura; con usuario es un ejercicio
 * propio, que solo ve y modifica su dueño (reglas R1 y R2).
 */
@Entity
@Table(name = "ejercicio")
public class Ejercicio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 80)
    private String nombre;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "VARCHAR(20)")
    private GrupoMuscular grupoMuscular;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "VARCHAR(20)")
    private Equipo equipo;

    /** Objetivos para los que se recomienda. Van en su propia tabla, sin clase aparte. */
    @ElementCollection
    @CollectionTable(
            name = "ejercicio_objetivo",
            joinColumns = @JoinColumn(name = "ejercicio_id"),
            foreignKey = @ForeignKey(name = "fk_ejercicio_objetivo_ejercicio"))
    @Enumerated(EnumType.STRING)
    @Column(name = "objetivo", nullable = false, columnDefinition = "VARCHAR(20)")
    private Set<Objetivo> objetivos = new HashSet<>();

    @Column(length = 500)
    private String descripcion;

    /** Dueño del ejercicio propio; {@code null} en los del catálogo base. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", foreignKey = @ForeignKey(name = "fk_ejercicio_usuario"))
    private Usuario usuario;

    @Column(nullable = false, columnDefinition = "BOOLEAN")
    private boolean activo;

    /** Lo exige JPA; el código de la aplicación usa el otro constructor. */
    protected Ejercicio() {
    }

    /**
     * Crea un ejercicio activo. Con {@code usuario} en {@code null} queda en el catálogo base;
     * con un usuario, queda como ejercicio propio de él.
     */
    public Ejercicio(String nombre, GrupoMuscular grupoMuscular, Equipo equipo, Set<Objetivo> objetivos,
            String descripcion, Usuario usuario) {
        this.nombre = nombre;
        this.grupoMuscular = grupoMuscular;
        this.equipo = equipo;
        this.objetivos = new HashSet<>(objetivos);
        this.descripcion = descripcion;
        this.usuario = usuario;
        this.activo = true;
    }

    /** Reemplaza los datos de un ejercicio propio (historia H8). */
    public void actualizar(String nombre, GrupoMuscular grupoMuscular, Equipo equipo, Set<Objetivo> objetivos,
            String descripcion) {
        this.nombre = nombre;
        this.grupoMuscular = grupoMuscular;
        this.equipo = equipo;
        this.objetivos.clear();
        this.objetivos.addAll(objetivos);
        this.descripcion = descripcion;
    }

    /** Borrado lógico (regla R3): deja de listarse, pero sigue en rutinas e historial. */
    public void desactivar() {
        this.activo = false;
    }

    /** Un ejercicio sin dueño es del catálogo base. */
    public boolean esBase() {
        return usuario == null;
    }

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public GrupoMuscular getGrupoMuscular() {
        return grupoMuscular;
    }

    public Equipo getEquipo() {
        return equipo;
    }

    public Set<Objetivo> getObjetivos() {
        return Collections.unmodifiableSet(objetivos);
    }

    public String getDescripcion() {
        return descripcion;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public boolean isActivo() {
        return activo;
    }
}