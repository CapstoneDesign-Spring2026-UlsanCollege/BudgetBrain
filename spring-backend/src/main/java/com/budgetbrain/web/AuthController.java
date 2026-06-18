package com.budgetbrain.web;

import com.budgetbrain.model.User;
import com.budgetbrain.repository.UserRepository;
import com.budgetbrain.security.JwtService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.time.*;
import java.util.*;
import static com.budgetbrain.web.ApiExceptionHandler.ApiProblem;

@RestController @RequestMapping("/api/auth")
public class AuthController extends ControllerSupport {
  private final UserRepository users; private final PasswordEncoder passwords; private final JwtService jwt;
  public AuthController(UserRepository users, PasswordEncoder passwords, JwtService jwt) { this.users = users; this.passwords = passwords; this.jwt = jwt; }
  public record Credentials(@NotBlank String email, @NotBlank String password) {}
  public record Registration(@NotBlank String name, @Email String email, @Pattern(regexp="^(?=.*[A-Za-z])(?=.*\\d).{8,}$", message="Password must be at least 8 characters and include a letter and number.") String password) {}

  @PostMapping("/register") ResponseEntity<?> register(@Valid @RequestBody Registration body) {
    String email = body.email().trim().toLowerCase(Locale.ROOT);
    if (users.findByEmailIgnoreCase(email).isPresent()) throw new ApiProblem(HttpStatus.BAD_REQUEST, "User already exists.");
    User user = new User(); user.name = required(body.name(), "Name is required."); user.email = email; user.password = passwords.encode(body.password());
    users.save(user); return ResponseEntity.status(201).body(authBody(user));
  }
  @PostMapping("/login") Map<String,Object> login(@Valid @RequestBody Credentials body) {
    User user = users.findByEmailIgnoreCase(body.email().trim()).orElseThrow(() -> new ApiProblem(HttpStatus.BAD_REQUEST, "Invalid email or password."));
    if (!passwords.matches(body.password(), user.password)) throw new ApiProblem(HttpStatus.BAD_REQUEST, "Invalid email or password.");
    return authBody(user);
  }
  @GetMapping("/me") Map<String,Object> me(Authentication auth) { return publicUser(user(auth)); }
  @PutMapping("/me") Map<String,Object> update(@RequestBody Map<String,String> body, Authentication auth) {
    User user = user(auth);
    if (body.containsKey("name")) user.name = required(body.get("name"), "Name is required.");
    if (body.containsKey("avatar")) user.avatar = required(body.get("avatar"), "Avatar is required.");
    users.save(user); return publicUser(user);
  }
  @PutMapping("/password") Map<String,String> password(@RequestBody Map<String,String> body, Authentication auth) {
    User user = user(auth); String current = body.get("currentPassword"); String next = body.get("newPassword");
    if (!passwords.matches(current == null ? "" : current, user.password)) throw new ApiProblem(HttpStatus.BAD_REQUEST, "Current password is incorrect.");
    validatePassword(next); user.password = passwords.encode(next); users.save(user); return Map.of("msg", "Password changed successfully");
  }
  @PostMapping("/forgot-password") Map<String,String> forgot(@RequestBody Map<String,String> body) {
    String email = body.getOrDefault("email", "").trim().toLowerCase(Locale.ROOT);
    Optional<User> found = users.findByEmailIgnoreCase(email); Map<String,String> response = new HashMap<>();
    response.put("msg", "If an account exists for that email, a password reset code has been generated.");
    found.ifPresent(user -> { String code = String.format("%06d", new SecureRandom().nextInt(1_000_000)); user.resetPasswordToken = hash(code); user.resetPasswordExpires = Instant.now().plus(Duration.ofMinutes(10)); user.resetPasswordAttempts = 0; users.save(user); response.put("resetCode", code); });
    return response;
  }
  @PostMapping("/reset-password") Map<String,String> reset(@RequestBody Map<String,String> body) {
    String email = body.getOrDefault("email", "").trim(); String code = body.getOrDefault("code", "").replaceAll("\\s", ""); String next = body.get("password"); validatePassword(next);
    User user = users.findByEmailIgnoreCase(email).orElseThrow(() -> new ApiProblem(HttpStatus.BAD_REQUEST, "Password reset code is invalid or expired."));
    if (user.resetPasswordExpires == null || user.resetPasswordExpires.isBefore(Instant.now()) || !Objects.equals(user.resetPasswordToken, hash(code))) throw new ApiProblem(HttpStatus.BAD_REQUEST, "Password reset code is invalid or expired.");
    user.password = passwords.encode(next); user.resetPasswordToken = null; user.resetPasswordExpires = null; user.resetPasswordAttempts = 0; users.save(user);
    return Map.of("msg", "Password reset successfully. You can log in with your new password.");
  }
  private void validatePassword(String value) { if (value == null || value.length() < 8 || !value.matches(".*[A-Za-z].*") || !value.matches(".*\\d.*")) throw new ApiProblem(HttpStatus.BAD_REQUEST, "New password must be at least 8 characters and include a letter and number."); }
  private String hash(String value) { try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8))); } catch (NoSuchAlgorithmException e) { throw new IllegalStateException(e); } }
  private Map<String,Object> authBody(User user) { return Map.of("token", jwt.issue(user.id), "user", publicUser(user)); }
  private Map<String,Object> publicUser(User u) { Map<String,Object> map = new LinkedHashMap<>(); map.put("id",u.id); map.put("name",u.name); map.put("email",u.email); map.put("avatar",u.avatar); map.put("createdAt",u.createdAt); return map; }
}
