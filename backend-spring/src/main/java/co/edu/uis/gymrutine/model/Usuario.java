package co.edu.uis.gymrutine.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDateTime;
import java.util.Locale;

/**
 * Cuenta de una persona que usa GymRutine. Tabla {@code usuario} (MODELO-DATOS §4).
 * La contraseña nunca se guarda: solo su hash BCrypt.
 */
@Entity
@Table(name = "usuario", uniqueConstraints = @UniqueConstraint(name = "uk_usuario_email", columnNames = "email"))
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 80)
    private String nombre;

    @Column(nullable = false, length = 120)
    private String email;

    @Column(nullable = false, length = 60)
    private String contrasenaHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "VARCHAR(20)")
    private Objetivo objetivo;

    @Column(nullable = false)
    private LocalDateTime fechaRegistro;

    /** Lo exige JPA; el código de la aplicación usa el otro constructor. */
    protected Usuario() {
    }

    public Usuario(String nombre, String email, String contrasenaHash, Objetivo objetivo) {
        this.nombre = nombre;
        this.email = normalizarEmail(email);
        this.contrasenaHash = contrasenaHash;
        this.objetivo = objetivo;
        this.fechaRegistro = LocalDateTime.now();
    }

    /**
     * El email se guarda y se busca sin espacios alrededor y en minúsculas,
     * para que "Ana@Correo.com " y "ana@correo.com" sean la misma cuenta.
     */
    public static String normalizarEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    /** Cambia lo que el usuario puede editar en su perfil (historia H4). */
    public void actualizarPerfil(String nombre, Objetivo objetivo) {
        this.nombre = nombre;
        this.objetivo = objetivo;
    }

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public String getEmail() {
        return email;
    }

    public String getContrasenaHash() {
        return contrasenaHash;
    }

    public Objetivo getObjetivo() {
        return objetivo;
    }

    public LocalDateTime getFechaRegistro() {
        return fechaRegistro;
    }
}