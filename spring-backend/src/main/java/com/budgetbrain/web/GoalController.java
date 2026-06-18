package com.budgetbrain.web;

import com.budgetbrain.model.*; import com.budgetbrain.repository.*;
import org.springframework.http.*; import org.springframework.security.core.Authentication; import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal; import java.time.LocalDate; import java.util.*; import static com.budgetbrain.web.ApiExceptionHandler.ApiProblem;

@RestController @RequestMapping("/api/goals")
public class GoalController extends ControllerSupport {
  private final GoalRepository goals; public GoalController(GoalRepository goals){this.goals=goals;}
  public record Request(String name,BigDecimal targetAmount,BigDecimal savedAmount,LocalDate deadline,String icon){}
  @GetMapping List<Goal> all(Authentication a){return goals.findByUserIdOrderByCreatedAtDesc(user(a).id);}
  @PostMapping ResponseEntity<Goal> create(@RequestBody Request r,Authentication a){Goal g=new Goal();g.user=user(a);apply(g,r,true);return ResponseEntity.status(201).body(goals.save(g));}
  @PutMapping("/{id}") Goal update(@PathVariable Long id,@RequestBody Request r,Authentication a){Goal g=find(id,a);apply(g,r,false);return goals.save(g);}
  @RequestMapping(value="/{id}/savings",method={RequestMethod.POST,RequestMethod.PUT,RequestMethod.PATCH}) Goal save(@PathVariable Long id,@RequestBody Map<String,BigDecimal> r,Authentication a){Goal g=find(id,a);g.savedAmount=g.savedAmount.add(positive(r.get("amount"),"Savings amount"));return goals.save(g);}
  @DeleteMapping("/{id}") Map<String,String> delete(@PathVariable Long id,Authentication a){goals.delete(find(id,a));return Map.of("msg","Goal removed");}
  private Goal find(Long id,Authentication a){return goals.findByIdAndUserId(id,user(a).id).orElseThrow(()->new ApiProblem(HttpStatus.NOT_FOUND,"Goal not found."));}
  private void apply(Goal g,Request r,boolean create){if(create||r.name()!=null)g.name=required(r.name(),"Goal name is required.");if(create||r.targetAmount()!=null)g.targetAmount=positive(r.targetAmount(),"Target amount");if(r.savedAmount()!=null){if(r.savedAmount().signum()<0)throw new ApiProblem(HttpStatus.BAD_REQUEST,"Saved amount cannot be negative.");g.savedAmount=r.savedAmount();}if(r.deadline()!=null)g.deadline=r.deadline();if(r.icon()!=null)g.icon=required(r.icon(),"Goal icon is required.");}
}
