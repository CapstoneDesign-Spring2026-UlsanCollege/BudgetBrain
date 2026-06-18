package com.budgetbrain.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "app_users", uniqueConstraints = @UniqueConstraint(columnNames = "email"))
public class User {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
  @Column(nullable = false, length = 80) public String name;
  @Column(nullable = false, length = 254) public String email;
  @JsonIgnore @Column(nullable = false) public String password;
  @Column(nullable = false, length = 32) public String avatar = "🎯";
  @JsonIgnore public String resetPasswordToken;
  @JsonIgnore public Instant resetPasswordExpires;
  @JsonIgnore public int resetPasswordAttempts;
  @Column(nullable = false, updatable = false) public Instant createdAt = Instant.now();
}
