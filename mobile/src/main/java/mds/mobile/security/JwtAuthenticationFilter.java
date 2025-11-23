package mds.mobile.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.ArrayList;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userId;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            if (log.isDebugEnabled()) {
                log.debug("No Bearer token for path {} - header={} ", request.getRequestURI(), authHeader);
            }
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);
        if (log.isDebugEnabled()) {
            log.debug("Attempting JWT auth for path {} tokenLength={} ", request.getRequestURI(), jwt.length());
        }

        try {
            userId = jwtService.extractUserId(jwt);
            if (log.isDebugEnabled()) {
                log.debug("Extracted userId {} from token", userId);
            }

            if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                if (jwtService.validateToken(jwt)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userId,
                            null,
                            new ArrayList<>()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    if (log.isDebugEnabled()) {
                        log.debug("Authentication successful for userId {} on path {}", userId, request.getRequestURI());
                    }
                } else if (log.isDebugEnabled()) {
                    log.debug("Token validation failed (expired or invalid) for path {}", request.getRequestURI());
                }
            }
        } catch (Exception e) {
            log.error("JWT processing error on path {}: {}", request.getRequestURI(), e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
