package com.budgetbrain.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Date;

@Service
public class JwtService {
  private final SecretKey key;
  public JwtService(@Value("${app.jwt.secret}") String secret) {
    if (secret.length() < 32) throw new IllegalStateException("JWT_SECRET must be at least 32 characters");
    key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
  }
  public String issue(Long userId) {
    Date now = new Date();
    return Jwts.builder().subject(userId.toString()).issuedAt(now)
      .expiration(new Date(now.getTime() + Duration.ofDays(7).toMillis())).signWith(key).compact();
  }
  public Long verify(String token) {
    return Long.valueOf(Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload().getSubject());
  }
}
