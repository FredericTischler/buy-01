package com.buy01.apigateway.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.List;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import reactor.core.publisher.Mono;

public class JwtAuthenticationManager implements ReactiveAuthenticationManager {

    private final Key signingKey;

    public JwtAuthenticationManager(String secret) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    @Override
    public Mono<Authentication> authenticate(Authentication authentication) {
        if (!(authentication instanceof JwtPreAuthenticationToken token)) {
            return Mono.error(new BadCredentialsException("Invalid authentication token"));
        }
        try {
            Claims claims =
                    Jwts.parserBuilder()
                            .setSigningKey(signingKey)
                            .build()
                            .parseClaimsJws(token.getToken())
                            .getBody();
            String subject = claims.getSubject();
            String role = claims.get("role", String.class);
            if (subject == null || role == null) {
                return Mono.error(new BadCredentialsException("Missing token claims"));
            }
            AbstractAuthenticationToken authToken =
                    new JwtAuthenticatedUserToken(
                            subject,
                            role,
                            List.of(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase())));
            authToken.setDetails(claims);
            return Mono.just(authToken);
        } catch (Exception ex) {
            return Mono.error(new BadCredentialsException("Invalid token", ex));
        }
    }
}
