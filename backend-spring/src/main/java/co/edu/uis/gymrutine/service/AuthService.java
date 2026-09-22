package co.edu.uis.gymrutine.service;

import co.edu.uis.gymrutine.dto.LoginRequest;
import co.edu.uis.gymrutine.dto.RegistroRequest;
import co.edu.uis.gymrutine.dto.SesionResponse;
import co.edu.uis.gymrutine.error.CodigoError;
import co.edu.uis.gymrutine.error.ErrorApi;
import co.edu.uis.gymrutine.model.TokenAcceso;
import co.edu.uis.gymrutine.model.Usuario;
import co.edu.uis.gymrutine.repository.TokenAccesoRepository;
import co.edu.uis.gymrutine.repository.UsuarioRepository;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Map;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Registro, inicio y cierre de sesión, y validación del token (historias H1 a H3, regla R9). */
@Service
public class AuthService {

    /** BCrypt solo usa los primeros 72 bytes de la contraseña, y una tilde o una ñ ocupan 2. */
    private static final int MAXIMO_BYTES_CONTRASENA = 72;

    private final UsuarioRepository usuarioRepository;
    private final TokenAccesoRepository tokenAccesoRepository;
    private final PasswordEncoder codificadorContrasenas;

    public AuthService(UsuarioRepository usuarioRepository, TokenAccesoRepository tokenAccesoRepository,
            PasswordEncoder codificadorContrasenas) {
        this.usuarioRepository = usuarioRepository;
        this.tokenAccesoRepository = tokenAccesoRepository;
        this.codificadorContrasenas = codificadorContrasenas;
    }

    @Transactional
    public SesionResponse registrar(RegistroRequest datos) {
        // BCrypt no cifra más de 72 bytes: se avisa como un error del campo y no como un 500
        if (datos.contrasena().getBytes(StandardCharsets.UTF_8).length > MAXIMO_BYTES_CONTRASENA) {
            throw new ErrorApi(CodigoError.VALIDACION_FALLIDA, "Hay campos con errores",
                    Map.of("contrasena", "Es demasiado larga: las tildes y la ñ cuentan doble"));
        }
        if (usuarioRepository.existsByEmail(datos.email())) {
            throw new ErrorApi(CodigoError.EMAIL_YA_REGISTRADO, "Ya existe una cuenta con este email");
        }
        String hash = codificadorContrasenas.encode(datos.contrasena());
        Usuario usuario = usuarioRepository.save(new Usuario(datos.nombre(), datos.email(), hash, datos.objetivo()));
        return abrirSesion(usuario);
    }

    /** Responde lo mismo si el email no existe o si la contraseña no coincide: no revela qué emails hay. */
    @Transactional
    public SesionResponse iniciarSesion(LoginRequest datos) {
        Usuario usuario = usuarioRepository.findByEmail(datos.email())
                .filter(encontrado -> codificadorContrasenas.matches(datos.contrasena(), encontrado.getContrasenaHash()))
                .orElseThrow(() -> new ErrorApi(CodigoError.CREDENCIALES_INVALIDAS, "Email o contraseña incorrectos"));
        tokenAccesoRepository.deleteByUsuarioAndFechaExpiracionBefore(usuario, LocalDateTime.now());
        return abrirSesion(usuario);
    }

    @Transactional
    public void cerrarSesion(String token) {
        tokenAccesoRepository.deleteByToken(token);
    }

    /** El id del dueño del token, si existe y no ha vencido. Si no, 401 {@code NO_AUTENTICADO}. */
    @Transactional(readOnly = true)
    public Long usuarioIdDelToken(String token) {
        return tokenAccesoRepository.findByToken(token)
                .filter(TokenAcceso::estaVigente)
                .map(tokenAcceso -> tokenAcceso.getUsuario().getId())
                .orElseThrow(() -> new ErrorApi(CodigoError.NO_AUTENTICADO, "La sesión no es válida o ya venció"));
    }

    private SesionResponse abrirSesion(Usuario usuario) {
        TokenAcceso tokenAcceso = tokenAccesoRepository.save(new TokenAcceso(usuario));
        return SesionResponse.desde(tokenAcceso);
    }
}