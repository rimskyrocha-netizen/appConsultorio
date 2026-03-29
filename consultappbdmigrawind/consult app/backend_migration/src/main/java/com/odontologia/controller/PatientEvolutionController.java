package com.odontologia.controller;

import com.odontologia.model.PatientEvolution;
import com.odontologia.repository.PatientEvolutionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/evolutions")
@CrossOrigin(origins = "*")
public class PatientEvolutionController {

    @Autowired
    private PatientEvolutionRepository repository;

    private static final Logger logger = LoggerFactory.getLogger(PatientEvolutionController.class);

    @GetMapping("/patient/{patientId}")
    public List<PatientEvolution> getByPatient(@PathVariable String patientId) {
        return repository.findByPatientId(patientId);
    }

    @PostMapping
    public ResponseEntity<?> save(@RequestBody PatientEvolution evolution) {
        try {
            if (evolution.getId() == null || evolution.getId().isEmpty()) {
                evolution.setId(UUID.randomUUID().toString());
            }
            PatientEvolution saved = repository.save(evolution);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            logger.error("Erro ao salvar evolução: ", e);
            return ResponseEntity.internalServerError().body("Erro ao salvar evolução: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        try {
            repository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Erro ao excluir evolução: ", e);
            return ResponseEntity.internalServerError().body("Erro ao excluir evolução.");
        }
    }
}
