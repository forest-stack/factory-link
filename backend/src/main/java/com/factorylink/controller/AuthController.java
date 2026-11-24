package com.factorylink.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.nio.charset.StandardCharsets;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.HttpSessionCsrfTokenRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final HttpSessionSecurityContextRepository contexts;
    private final HttpSessionCsrfTokenRepository csrfTokens;

    public AuthController(
        AuthenticationManager authenticationManager, HttpSessionSecurityContextRepository contexts,
        HttpSessionCsrfTokenRepository csrfTokens
    ) {
        this.authenticationManager = authenticationManager;
        this.contexts = contexts;
        this.csrfTokens = csrfTokens;
    }

    public record LoginInput(@NotBlank @Size(max = 80) String username, @NotBlank @Size(max = 72) String password) {}
    public record SessionUser(String username) {}
    public record CsrfView(String headerName, String token) {}

    @GetMapping("/csrf")
    public CsrfView csrf(CsrfToken token) {
        return new CsrfView(token.getHeaderName(), token.getToken());
    }

    @PostMapping("/login")
    public SessionUser login(
        @Valid @RequestBody LoginInput input, HttpServletRequest request, HttpServletResponse response
    ) {
        if (input.password().getBytes(StandardCharsets.UTF_8).length > 72) {
            throw invalidCredentials();
        }

        Authentication authenticated;
        try {
            authenticated = authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken.unauthenticated(input.username().strip(), input.password())
            );
        } catch (AuthenticationException error) {
            throw invalidCredentials();
        }

        // 认证后轮换 Session ID 和 CSRF token，避免复用登录前创建的会话标识。
        request.getSession(true);
        request.changeSessionId();
        csrfTokens.saveToken(null, request, response);
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authenticated);
        SecurityContextHolder.setContext(context);
        contexts.saveContext(context, request, response);
        return new SessionUser(authenticated.getName());
    }

    @GetMapping("/me")
    public SessionUser me(Authentication authentication) {
        return new SessionUser(authentication.getName());
    }

    private ResponseStatusException invalidCredentials() {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "ユーザーIDまたはパスワードが正しくありません。");
    }
}
