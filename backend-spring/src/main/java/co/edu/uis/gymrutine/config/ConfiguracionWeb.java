package co.edu.uis.gymrutine.config;

import co.edu.uis.gymrutine.seguridad.InterceptorAutenticacion;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** Toda la API exige token, menos crear cuenta, iniciar sesión y las referencias. */
@Configuration
public class ConfiguracionWeb implements WebMvcConfigurer {

    private final InterceptorAutenticacion interceptorAutenticacion;

    public ConfiguracionWeb(InterceptorAutenticacion interceptorAutenticacion) {
        this.interceptorAutenticacion = interceptorAutenticacion;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registro) {
        registro.addInterceptor(interceptorAutenticacion)
                .addPathPatterns("/api/**")
                .excludePathPatterns("/api/auth/registro", "/api/auth/login", "/api/referencias");
    }
}
