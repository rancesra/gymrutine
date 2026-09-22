package co.edu.uis.gymrutine.service;

import co.edu.uis.gymrutine.dto.ActualizarPerfilRequest;
import co.edu.uis.gymrutine.dto.UsuarioResponse;
import co.edu.uis.gymrutine.error.CodigoError;
import co.edu.uis.gymrutine.error.ErrorApi;
import co.edu.uis.gymrutine.model.Usuario;
import co.edu.uis.gymrutine.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** El perfil del usuario autenticado (historia H4). */
@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public UsuarioResponse obtener(Long usuarioId) {
        return UsuarioResponse.desde(buscar(usuarioId));
    }

    /** No hace falta llamar a save(): JPA guarda los cambios de la entidad al terminar la transacción. */
    @Transactional
    public UsuarioResponse actualizarPerfil(Long usuarioId, ActualizarPerfilRequest datos) {
        Usuario usuario = buscar(usuarioId);
        usuario.actualizarPerfil(datos.nombre(), datos.objetivo());
        return UsuarioResponse.desde(usuario);
    }

    private Usuario buscar(Long usuarioId) {
        return usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ErrorApi(CodigoError.NO_AUTENTICADO, "La sesión no es válida o ya venció"));
    }
}