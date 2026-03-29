package com.odontologia.controller;

import com.odontologia.model.Supply;
import com.odontologia.repository.SupplyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/supplies")
@CrossOrigin(origins = "*")
public class SupplyController {

    @Autowired
    private SupplyRepository repository;

    @GetMapping
    public List<Supply> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public ResponseEntity<Supply> save(@RequestBody Supply supply) {
        if (supply.getId() == null || supply.getId().isEmpty()) {
            supply.setId(UUID.randomUUID().toString());
        }
        return ResponseEntity.ok(repository.save(supply));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        repository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
