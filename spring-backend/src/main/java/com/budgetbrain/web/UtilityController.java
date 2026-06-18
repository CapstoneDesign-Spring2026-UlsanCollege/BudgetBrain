package com.budgetbrain.web;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;
import java.time.Instant;
import java.util.*;
import static com.budgetbrain.web.ApiExceptionHandler.ApiProblem;

@RestController @RequestMapping("/api")
public class UtilityController {
  private static final Set<String> CURRENCIES = Set.of("NPR","USD","EUR","GBP","JPY","CAD","AUD","SGD","KRW","INR");
  private final RestClient http = RestClient.create();
  @Value("${app.ocr.url}") String ocrUrl; @Value("${app.ocr.key}") String ocrKey;
  @GetMapping("/health") Map<String,String> health(){return Map.of("status","ok","database","connected");}
  @GetMapping("/exchange/currencies") Map<String,Object> currencies(){return Map.of("base","NPR","currencies",CURRENCIES);}
  @GetMapping("/exchange/rate") Map<String,Object> rate(@RequestParam String from,@RequestParam String to){
    from=from.toUpperCase(Locale.ROOT);to=to.toUpperCase(Locale.ROOT);if(!CURRENCIES.contains(from)||!CURRENCIES.contains(to))throw new ApiProblem(HttpStatus.BAD_REQUEST,"Unsupported currency.");
    if(from.equals(to))return rateBody(from,to,1d,"Identity conversion");
    try{Map<?,?> payload=http.get().uri("https://open.er-api.com/v6/latest/{from}",from).retrieve().body(Map.class);Map<?,?> rates=(Map<?,?>)payload.get("rates");double value=((Number)rates.get(to)).doubleValue();return rateBody(from,to,value,"ExchangeRate-API");}catch(Exception ex){throw new ApiProblem(HttpStatus.SERVICE_UNAVAILABLE,"Exchange rates are temporarily unavailable.");}
  }
  @PostMapping("/ocr/receipt") Object ocr(@RequestBody Map<String,Object> body){
    if(ocrUrl==null||ocrUrl.isBlank())throw new ApiProblem(HttpStatus.SERVICE_UNAVAILABLE,"Receipt OCR service is not configured.");
    RestClient.RequestBodySpec request=http.post().uri(ocrUrl).contentType(MediaType.APPLICATION_JSON);if(ocrKey!=null&&!ocrKey.isBlank())request.header("Authorization","Bearer "+ocrKey);return request.body(body).retrieve().body(Object.class);
  }
  private Map<String,Object> rateBody(String from,String to,double rate,String provider){Map<String,Object> m=new LinkedHashMap<>();m.put("from",from);m.put("to",to);m.put("rate",rate);m.put("provider",provider);m.put("fetchedAt",Instant.now().toEpochMilli());m.put("cached",false);return m;}
}
