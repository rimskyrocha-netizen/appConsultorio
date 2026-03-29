package com.odontologia.controller;

import com.odontologia.model.PaymentRecord;
import com.odontologia.repository.PaymentRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentRecordRepository repository;

    @GetMapping("/patient/{patientId}")
    public List<PaymentRecord> getByPatient(@PathVariable String patientId) {
        return repository.findByPatientId(patientId);
    }

    @PostMapping
    public ResponseEntity<PaymentRecord> save(@RequestBody PaymentRecord payment) {
        if (payment.getId() == null || payment.getId().isEmpty()) {
            payment.setId(UUID.randomUUID().toString());
        }
        return ResponseEntity.ok(repository.save(payment));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        repository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
