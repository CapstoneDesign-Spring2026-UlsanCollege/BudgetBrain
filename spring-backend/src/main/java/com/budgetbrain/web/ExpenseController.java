package com.budgetbrain.web;

import com.budgetbrain.model.*; import com.budgetbrain.repository.*;
import org.springframework.http.*; import org.springframework.security.core.Authentication; import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal; import java.util.*; import static com.budgetbrain.web.ApiExceptionHandler.ApiProblem;

@RestController @RequestMapping("/api/expenses")
public class ExpenseController extends ControllerSupport {
  private final ExpenseRepository expenses; private final BudgetRepository budgets;
  public ExpenseController(ExpenseRepository expenses,BudgetRepository budgets){this.expenses=expenses;this.budgets=budgets;}
  public record Request(String name,BigDecimal amount,Long budgetId,String category,String receiptImage){}
  @GetMapping List<Expense> all(Authentication auth){return expenses.findByUserIdOrderByCreatedAtDesc(user(auth).id);}
  @PostMapping ResponseEntity<Expense> create(@RequestBody Request body,Authentication auth){User u=user(auth);Budget b=budgets.findByIdAndUserId(body.budgetId(),u.id).orElseThrow(()->new ApiProblem(HttpStatus.NOT_FOUND,"Budget not found."));Expense e=new Expense();e.user=u;e.budgetEntity=b;apply(e,body,true);return ResponseEntity.status(201).body(expenses.save(e));}
  @PutMapping("/{id}") Expense update(@PathVariable Long id,@RequestBody Request body,Authentication auth){Expense e=find(id,auth);apply(e,body,false);return expenses.save(e);}
  @DeleteMapping("/{id}") Map<String,String> delete(@PathVariable Long id,Authentication auth){expenses.delete(find(id,auth));return Map.of("msg","Expense removed");}
  @GetMapping("/{id}/image") ResponseEntity<byte[]> image(@PathVariable Long id,Authentication auth){Expense e=find(id,auth);if(e.receiptImage==null)throw new ApiProblem(HttpStatus.NOT_FOUND,"Receipt image not found.");return ResponseEntity.ok().contentType(MediaType.parseMediaType(e.receiptImageType)).cacheControl(CacheControl.noStore()).body(e.receiptImage);}
  private Expense find(Long id,Authentication auth){return expenses.findByIdAndUserId(id,user(auth).id).orElseThrow(()->new ApiProblem(HttpStatus.NOT_FOUND,"Expense not found."));}
  private void apply(Expense e,Request r,boolean create){if(create||r.name()!=null)e.name=required(r.name(),"Expense name is required.");if(create||r.amount()!=null)e.amount=positive(r.amount(),"Expense amount");if(r.category()!=null)e.category=required(r.category(),"Expense category is required.");if(r.receiptImage()!=null&&!r.receiptImage().isBlank()){String[] parts=r.receiptImage().split(",",2);if(parts.length!=2||!parts[0].matches("data:image/(png|jpeg|jpg|webp);base64"))throw new ApiProblem(HttpStatus.BAD_REQUEST,"Receipt must be a PNG, JPEG, or WebP image.");try{byte[] data=Base64.getDecoder().decode(parts[1]);if(data.length>5_000_000)throw new ApiProblem(HttpStatus.PAYLOAD_TOO_LARGE,"Receipt image is too large.");e.receiptImage=data;e.receiptImageType=parts[0].substring(5,parts[0].indexOf(';'));}catch(IllegalArgumentException ex){throw new ApiProblem(HttpStatus.BAD_REQUEST,"Receipt image is invalid.");}}}
}
