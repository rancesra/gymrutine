package co.edu.uis.gymrutine.dto;

import co.edu.uis.gymrutine.model.TokenAcceso;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

/** Respuesta del registro y del inicio de sesión: el token, cuándo vence y el usuario (contrato §3). */
public record SesionResponse(
        String token,
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") LocalDateTime expiraEn,
        UsuarioResponse usuario) {

    public static SesionResponse desde(TokenAcceso tokenAcceso) {
        return new SesionResponse(tokenAcceso.getToken(), tokenAcceso.getFechaExpiracion(),
                UsuarioResponse.desde(tokenAcceso.getUsuario()));
    }
}