package com.budgetbrain.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "expenses", indexes = {@Index(columnList = "user_id,created_at"), @Index(columnList = "budget_id")})
public class Expense {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
  @JsonIgnore @ManyToOne(optional = false, fetch = FetchType.LAZY) @JoinColumn(name = "user_id") public User user;
  @JsonIgnore @ManyToOne(optional = false, fetch = FetchType.LAZY) @JoinColumn(name = "budget_id") public Budget budgetEntity;
  @Column(nullable = false, length = 120) public String name;
  @Column(nullable = false, precision = 14, scale = 2) public BigDecimal amount;
  @Column(nullable = false, length = 3) public String currency = "NPR";
  @Column(nullable = false, length = 40) public String category = "other";
  @JsonIgnore @Column(name = "receipt_image", columnDefinition = "bytea") public byte[] receiptImage;
  @JsonIgnore public String receiptImageType;
  @Column(name = "created_at", nullable = false, updatable = false) public Instant createdAt = Instant.now();

  @JsonProperty("budget") public Long budget() { return budgetEntity.id; }
  @JsonProperty("imageUrl") public String imageUrl() { return receiptImage == null ? null : "/api/expenses/" + id + "/image"; }
}
