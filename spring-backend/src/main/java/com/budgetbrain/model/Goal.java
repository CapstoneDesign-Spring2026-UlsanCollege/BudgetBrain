package com.budgetbrain.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;

@Entity
@Table(name = "goals", indexes = @Index(columnList = "user_id,created_at"))
public class Goal {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
  @JsonIgnore @ManyToOne(optional = false, fetch = FetchType.LAZY) @JoinColumn(name = "user_id") public User user;
  @Column(nullable = false, length = 120) public String name;
  @Column(nullable = false, precision = 14, scale = 2) public BigDecimal targetAmount;
  @Column(nullable = false, precision = 14, scale = 2) public BigDecimal savedAmount = BigDecimal.ZERO;
  @Column(nullable = false, length = 3) public String currency = "NPR";
  public LocalDate deadline;
  @Column(nullable = false, length = 32) public String icon = "🎯";
  @Column(name = "created_at", nullable = false, updatable = false) public Instant createdAt = Instant.now();
}
