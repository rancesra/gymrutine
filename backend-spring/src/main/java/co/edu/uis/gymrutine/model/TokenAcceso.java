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
import jakarta.persistence.UniqueConstraint;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Token de inicio de sesión. Tabla {@code token_acceso} (MODELO-DATOS §4, regla R9).
 * Un usuario puede tener varios, uno por dispositivo donde inició sesión.
 */
@Entity
@Table(name = "token_acceso", uniqueConstraints = @UniqueConstraint(name = "uk_token_acceso_token", columnNames = "token"))
public class TokenAcceso {

    /** Tiempo que dura una sesión antes de vencer. */
    public static final Duration VIGENCIA = Duration.ofDays(7);

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false, foreignKey = @ForeignKey(name = "fk_token_acceso_usuario"))
    private Usuario usuario;

    @Column(nullable = false, length = 36, columnDefinition = "CHAR(36)")
    private String token;

    @Column(nullable = false)
    private LocalDateTime fechaCreacion;

    @Column(nullable = false)
    private LocalDateTime fechaExpiracion;

    /** Lo exige JPA; el código de la aplicación usa el otro constructor. */
    protected TokenAcceso() {
    }

    /** Crea un token nuevo y aleatorio para el usuario, que vence en {@link #VIGENCIA}. */
    public TokenAcceso(Usuario usuario) {
        this.usuario = usuario;
        this.token = UUID.randomUUID().toString();
        this.fechaCreacion = LocalDateTime.now();
        this.fechaExpiracion = fechaCreacion.plus(VIGENCIA);
    }

    /** Un token sirve mientras no haya llegado su fecha de expiración. */
    public boolean estaVigente() {
        return LocalDateTime.now().isBefore(fechaExpiracion);
    }

    public Long getId() {
        return id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public String getToken() {
        return token;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public LocalDateTime getFechaExpiracion() {
        return fechaExpiracion;
    }
}