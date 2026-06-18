package com.budgetbrain.repository;
import com.budgetbrain.model.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface BudgetRepository extends JpaRepository<Budget, Long> {
  List<Budget> findByUserIdOrderByCreatedAtDesc(Long userId);
  Optional<Budget> findByIdAndUserId(Long id, Long userId);
}
