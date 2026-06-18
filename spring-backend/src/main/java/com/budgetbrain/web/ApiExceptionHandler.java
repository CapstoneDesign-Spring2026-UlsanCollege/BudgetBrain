package com.budgetbrain.web;

import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {
  @ExceptionHandler(ApiProblem.class) ResponseEntity<Map<String,String>> problem(ApiProblem ex) {
    return ResponseEntity.status(ex.status).body(Map.of("msg", ex.getMessage()));
  }
  @ExceptionHandler(MethodArgumentNotValidException.class) ResponseEntity<Map<String,String>> invalid(MethodArgumentNotValidException ex) {
    String msg = ex.getBindingResult().getFieldErrors().stream().findFirst().map(e -> e.getDefaultMessage()).orElse("Invalid request.");
    return ResponseEntity.badRequest().body(Map.of("msg", msg));
  }
  public static class ApiProblem extends RuntimeException {
    final HttpStatus status;
    public ApiProblem(HttpStatus status, String message) { super(message); this.status = status; }
  }
}
