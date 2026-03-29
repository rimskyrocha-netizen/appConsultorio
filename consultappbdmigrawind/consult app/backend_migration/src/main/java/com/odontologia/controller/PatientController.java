package com.odontologia.controller;

import com.odontologia.model.Patient;
import com.odontologia.repository.PatientRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = "*") // Permite acesso do frontend local (Vite)
public class PatientController {

    @Autowired
    private PatientRepository patientRepository;

    private static final Logger logger = LoggerFactory.getLogger(PatientController.class);

    @GetMapping
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> createPatient(@RequestBody Patient patient) {
        try {
            if (patient.getId() == null || patient.getId().isEmpty()) {
                patient.setId(java.util.UUID.randomUUID().toString());
            }
            // CPF é opcional: se vier vazio, salvar como null
            if (patient.getCpf() != null && patient.getCpf().trim().isEmpty()) {
                patient.setCpf(null);
            }
            
            Patient saved = patientRepository.save(patient);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            logger.error("Erro ao salvar paciente: ", e);
            return ResponseEntity.internalServerError().body("Erro ao salvar paciente: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Patient> getPatientById(@PathVariable("id") String id) {
        return patientRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Patient> updatePatient(@PathVariable("id") String id, @RequestBody Patient patientDetails) {
        return patientRepository.findById(id)
                .map(patient -> {
                    patient.setName(patientDetails.getName());
                    patient.setCpf(patientDetails.getCpf());
                    patient.setBirthDate(patientDetails.getBirthDate());
                    patient.setPhone(patientDetails.getPhone());
                    patient.setEmail(patientDetails.getEmail());
                    patient.setTags(patientDetails.getTags());
                    patient.setMedicalHistory(patientDetails.getMedicalHistory());
                    patient.setObservations(patientDetails.getObservations());
                    Patient updated = patientRepository.save(patient);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePatient(@PathVariable("id") String id) {
        try {
            return patientRepository.findById(id)
                    .map(patient -> {
                        patientRepository.delete(patient);
                        return ResponseEntity.ok().build();
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            logger.error("Erro ao excluir paciente: ", e);
            return ResponseEntity.internalServerError().body("Não foi possível excluir o paciente. Verifique se ele possui agendamentos ou outros registros vinculados.");
        }
    }
}
