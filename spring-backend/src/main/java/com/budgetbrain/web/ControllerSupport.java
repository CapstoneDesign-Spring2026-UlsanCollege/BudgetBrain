package com.budgetbrain.web;

import com.budgetbrain.model.User;
import java.math.BigDecimal;
import static com.budgetbrain.web.ApiExceptionHandler.ApiProblem;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;

public abstract class ControllerSupport {
  protected User user(Authentication auth) { return (User) auth.getPrincipal(); }
  protected String required(String value, String message) {
    String clean = value == null ? "" : value.trim();
    if (clean.isEmpty()) throw new ApiProblem(HttpStatus.BAD_REQUEST, message); return clean;
  }
  protected BigDecimal positive(BigDecimal value, String label) {
    if (value == null || value.signum() <= 0) throw new ApiProblem(HttpStatus.BAD_REQUEST, label + " must be greater than zero."); return value;
  }
}
