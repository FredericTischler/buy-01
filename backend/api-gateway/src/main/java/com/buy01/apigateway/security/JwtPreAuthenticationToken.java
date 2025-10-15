package com.buy01.apigateway.security;

import org.springframework.security.authentication.AbstractAuthenticationToken;

public class JwtPreAuthenticationToken extends AbstractAuthenticationToken {

    private final String token;

    public JwtPreAuthenticationToken(String token) {
        super(null);
        this.token = token;
        setAuthenticated(false);
    }

    @Override
    public Object getCredentials() {
        return token;
    }

    @Override
    public Object getPrincipal() {
        return null;
    }

    public String getToken() {
        return token;
    }
}
