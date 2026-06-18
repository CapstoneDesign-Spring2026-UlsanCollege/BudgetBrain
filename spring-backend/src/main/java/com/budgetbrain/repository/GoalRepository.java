package com.budgetbrain.repository;
import com.budgetbrain.model.Goal;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface GoalRepository extends JpaRepository<Goal, Long> {
  List<Goal> findByUserIdOrderByCreatedAtDesc(Long userId);
  Optional<Goal> findByIdAndUserId(Long id, Long userId);
}
