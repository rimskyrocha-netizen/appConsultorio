package com.odontologia.controller;

import com.odontologia.model.UserAccount;
import com.odontologia.repository.UserAccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserAccountController {

    @Autowired
    private UserAccountRepository repository;

    @GetMapping
    public List<UserAccount> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public ResponseEntity<UserAccount> save(@RequestBody UserAccount user) {
        if (user.getId() == null || user.getId().isEmpty()) {
            user.setId(UUID.randomUUID().toString());
            user.setLastAccess("Nunca");
        }
        return ResponseEntity.ok(repository.save(user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        repository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        Optional<UserAccount> user = repository.findByEmail(email);
        if (user.isPresent() && user.get().getPassword().equals(password)) {
            if (user.get().getStatus().equals("INACTIVE")) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Usuário inativo. Entre em contato com o administrador.");
                return ResponseEntity.status(403).body(error);
            }
            // Update last access
            user.get().setLastAccess(new java.text.SimpleDateFormat("dd/MM/yyyy HH:mm").format(new java.util.Date()));
            repository.save(user.get());
            return ResponseEntity.ok(user.get());
        }

        Map<String, String> error = new HashMap<>();
        error.put("message", "E-mail ou senha incorretos.");
        return ResponseEntity.status(401).body(error);
    }
}
