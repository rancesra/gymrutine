package co.edu.uis.gymrutine.dto;

import co.edu.uis.gymrutine.model.Objetivo;
import co.edu.uis.gymrutine.model.Usuario;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

/** El usuario tal como lo ve la API: sin la contraseña (contrato §3). */
public record UsuarioResponse(
        Long id,
        String nombre,
        String email,
        Objetivo objetivo,
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") LocalDateTime fechaRegistro) {

    public static UsuarioResponse desde(Usuario usuario) {
        return new UsuarioResponse(usuario.getId(), usuario.getNombre(), usuario.getEmail(),
                usuario.getObjetivo(), usuario.getFechaRegistro());
    }
}