package com.buy01.apigateway.config;

import com.buy01.apigateway.security.JwtAuthenticationManager;
import com.buy01.apigateway.security.JwtServerAuthenticationConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.authentication.AuthenticationWebFilter;

@Configuration
@EnableReactiveMethodSecurity
public class SecurityConfig {

    @Value("${security.jwt.secret}")
    private String jwtSecret;

    @Bean
    public ReactiveAuthenticationManager jwtAuthenticationManager() {
        return new JwtAuthenticationManager(jwtSecret);
    }

    @Bean
    public JwtServerAuthenticationConverter jwtServerAuthenticationConverter() {
        return new JwtServerAuthenticationConverter();
    }

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(
            ServerHttpSecurity http,
            ReactiveAuthenticationManager jwtAuthenticationManager,
            JwtServerAuthenticationConverter jwtServerAuthenticationConverter) {
        AuthenticationWebFilter authenticationWebFilter = new AuthenticationWebFilter(jwtAuthenticationManager);
        authenticationWebFilter.setServerAuthenticationConverter(jwtServerAuthenticationConverter);

        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .cors(ServerHttpSecurity.CorsSpec::disable)
                .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
                .formLogin(ServerHttpSecurity.FormLoginSpec::disable)
                .authorizeExchange(exchange ->
                        exchange
                                .pathMatchers(
                                        "/actuator/**",
                                        "/auth/**",
                                        "/api/auth/**",
                                        "/api/users/register",
                                        "/docs/**",
                                        "/swagger-ui/**",
                                        "/v3/api-docs/**",
                                        "/public/**",
                                        "/api/media/view/**")
                                .permitAll()
                                .pathMatchers(HttpMethod.GET, "/api/products/**")
                                .permitAll()
                                .anyExchange()
                                .authenticated())
                .authenticationManager(jwtAuthenticationManager)
                .addFilterAt(authenticationWebFilter, SecurityWebFiltersOrder.AUTHENTICATION)
                .headers(headers -> headers
                        .contentSecurityPolicy(csp -> csp.policyDirectives("default-src 'self'"))
                        .xssProtection(ServerHttpSecurity.HeaderSpec.XssProtectionSpec::disable)
                        .frameOptions(frame -> frame.mode(org.springframework.security.web.server.header.XFrameOptionsServerHttpHeadersWriter.Mode.DENY)))
                .build();
    }
}
