package com.budgetbrain.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "budgets", indexes = @Index(columnList = "user_id,created_at"))
public class Budget {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
  @JsonIgnore @ManyToOne(optional = false, fetch = FetchType.LAZY) @JoinColumn(name = "user_id") public User user;
  @Column(nullable = false, length = 80) public String name;
  @Column(nullable = false, precision = 14, scale = 2) public BigDecimal amount;
  @Column(nullable = false, length = 3) public String currency = "NPR";
  @Column(nullable = false, length = 32) public String color;
  @Column(name = "created_at", nullable = false, updatable = false) public Instant createdAt = Instant.now();
}
