package com.odontologia.controller;

import com.odontologia.model.ClinicTransaction;
import com.odontologia.repository.ClinicTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "*")
public class ClinicTransactionController {

    @Autowired
    private ClinicTransactionRepository repository;

    @GetMapping
    public List<ClinicTransaction> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public ResponseEntity<ClinicTransaction> save(@RequestBody ClinicTransaction trans) {
        if (trans.getId() == null || trans.getId().isEmpty()) {
            trans.setId(UUID.randomUUID().toString());
        }
        return ResponseEntity.ok(repository.save(trans));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        repository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
