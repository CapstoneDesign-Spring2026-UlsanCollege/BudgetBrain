package com.budgetbrain.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {
  @GetMapping(value={"/login","/register","/forgot-password","/reset-password","/dashboard","/expenses","/analytics","/goals","/profile","/settings","/budget/**"})
  public String spa(){return "forward:/index.html";}
}
