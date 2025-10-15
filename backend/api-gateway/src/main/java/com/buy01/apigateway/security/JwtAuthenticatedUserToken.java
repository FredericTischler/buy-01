package com.buy01.apigateway.security;

import java.util.Collection;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;

public class JwtAuthenticatedUserToken extends AbstractAuthenticationToken {

    private final String userId;
    private final String role;

    public JwtAuthenticatedUserToken(String userId, String role, Collection<? extends GrantedAuthority> authorities) {
        super(authorities);
        this.userId = userId;
        this.role = role;
        setAuthenticated(true);
    }

    @Override
    public Object getCredentials() {
        return null;
    }

    @Override
    public Object getPrincipal() {
        return userId;
    }

    public String getRole() {
        return role;
    }
}
