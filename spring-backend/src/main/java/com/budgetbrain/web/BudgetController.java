package com.budgetbrain.web;

import com.budgetbrain.model.*; import com.budgetbrain.repository.*;
import jakarta.transaction.Transactional; import org.springframework.http.*; import org.springframework.security.core.Authentication; import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal; import java.util.*; import static com.budgetbrain.web.ApiExceptionHandler.ApiProblem;

@RestController @RequestMapping("/api/budgets")
public class BudgetController extends ControllerSupport {
  private final BudgetRepository budgets; private final ExpenseRepository expenses;
  public BudgetController(BudgetRepository budgets, ExpenseRepository expenses) { this.budgets=budgets; this.expenses=expenses; }
  public record Request(String name, BigDecimal amount, String color) {}
  @GetMapping List<Budget> all(Authentication auth) { return budgets.findByUserIdOrderByCreatedAtDesc(user(auth).id); }
  @PostMapping ResponseEntity<Budget> create(@RequestBody Request body, Authentication auth) { Budget b=new Budget(); b.user=user(auth); apply(b,body,true); return ResponseEntity.status(201).body(budgets.save(b)); }
  @PutMapping("/{id}") Budget update(@PathVariable Long id,@RequestBody Request body,Authentication auth) { Budget b=find(id,auth); apply(b,body,false); return budgets.save(b); }
  @Transactional @DeleteMapping("/{id}") Map<String,String> delete(@PathVariable Long id,Authentication auth) { Budget b=find(id,auth); expenses.deleteByBudgetEntityIdAndUserId(id,user(auth).id); budgets.delete(b); return Map.of("msg","Budget removed"); }
  private Budget find(Long id,Authentication auth) { return budgets.findByIdAndUserId(id,user(auth).id).orElseThrow(()->new ApiProblem(HttpStatus.NOT_FOUND,"Budget not found.")); }
  private void apply(Budget b,Request r,boolean create) { if(create||r.name()!=null)b.name=required(r.name(),"Budget name is required."); if(create||r.amount()!=null)b.amount=positive(r.amount(),"Budget amount"); if(create||r.color()!=null)b.color=required(r.color(),"Budget color is required."); }
}
