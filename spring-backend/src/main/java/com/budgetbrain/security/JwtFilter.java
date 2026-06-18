package com.budgetbrain.security;

import com.budgetbrain.repository.UserRepository;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;

@Component
public class JwtFilter extends OncePerRequestFilter {
  private final JwtService jwt;
  private final UserRepository users;
  public JwtFilter(JwtService jwt, UserRepository users) { this.jwt = jwt; this.users = users; }
  @Override protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
      throws ServletException, IOException {
    String token = req.getHeader("x-auth-token");
    String auth = req.getHeader("Authorization");
    if ((token == null || token.isBlank()) && auth != null && auth.startsWith("Bearer ")) token = auth.substring(7);
    if (token != null && !token.isBlank()) {
      try {
        Long id = jwt.verify(token);
        users.findById(id).ifPresent(user -> SecurityContextHolder.getContext().setAuthentication(
          new UsernamePasswordAuthenticationToken(user, token, List.of())));
      } catch (JwtException | IllegalArgumentException ignored) { }
    }
    chain.doFilter(req, res);
  }
}
