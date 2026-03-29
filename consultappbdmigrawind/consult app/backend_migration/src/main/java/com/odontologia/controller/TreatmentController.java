package com.odontologia.controller;

import com.odontologia.model.TreatmentProcedure;
import com.odontologia.repository.TreatmentProcedureRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/treatments")
@CrossOrigin(origins = "*")
public class TreatmentController {

    @Autowired
    private TreatmentProcedureRepository repository;

    @GetMapping("/patient/{patientId}")
    public List<TreatmentProcedure> getByPatient(@PathVariable String patientId) {
        return repository.findByPatientId(patientId);
    }

    @PostMapping
    public ResponseEntity<TreatmentProcedure> save(@RequestBody TreatmentProcedure proc) {
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
