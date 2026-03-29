package com.odontologia.controller;

import com.odontologia.model.BaseProcedure;
import com.odontologia.repository.BaseProcedureRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/base-procedures")
@CrossOrigin(origins = "*")
public class BaseProcedureController {

    @Autowired
    private BaseProcedureRepository repository;

    @GetMapping
    public List<BaseProcedure> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public ResponseEntity<BaseProcedure> save(@RequestBody BaseProcedure proc) {
        if (proc.getId() == null || proc.getId().isEmpty()) {
            proc.setId(UUID.randomUUID().toString());
        }
        return ResponseEntity.ok(repository.save(proc));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        repository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
