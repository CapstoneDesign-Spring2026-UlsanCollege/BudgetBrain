package com.budgetbrain.repository;
import com.budgetbrain.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
  List<Expense> findByUserIdOrderByCreatedAtDesc(Long userId);
  Optional<Expense> findByIdAndUserId(Long id, Long userId);
  void deleteByBudgetEntityIdAndUserId(Long budgetId, Long userId);
}
