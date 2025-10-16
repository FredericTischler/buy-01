package com.buy01.apigateway.security;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class UserContextRelayFilter implements GlobalFilter, Ordered {

    @Override
    public int getOrder() {
        return Ordered.LOWEST_PRECEDENCE;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        return ReactiveSecurityContextHolder.getContext()
                .map(SecurityContext::getAuthentication)
                .flatMap(authentication -> propagateHeaders(exchange, chain, authentication))
                .switchIfEmpty(chain.filter(exchange));
    }

    private Mono<Void> propagateHeaders(
            ServerWebExchange exchange, GatewayFilterChain chain, Authentication authentication) {
        if (authentication instanceof JwtAuthenticatedUserToken jwtToken) {
            ServerWebExchange mutatedExchange =
                    exchange.mutate()
                            .request(builder -> builder
                                    .header("X-User-Id", jwtToken.getPrincipal().toString())
                                    .header("X-User-Role", jwtToken.getRole()))
                            .build();
            return chain.filter(mutatedExchange);
        }
        return chain.filter(exchange);
    }
}
