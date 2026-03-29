package com.odontologia.controller;

import com.odontologia.model.Appointment;
import com.odontologia.repository.AppointmentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {

    @Autowired
    private AppointmentRepository appointmentRepository;

    private static final Logger logger = LoggerFactory.getLogger(AppointmentController.class);

    @GetMapping
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> createAppointment(@RequestBody Appointment appointment) {
        try {
            if (appointment.getId() == null || appointment.getId().isEmpty()) {
                appointment.setId(UUID.randomUUID().toString());
            }
            Appointment saved = appointmentRepository.save(appointment);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            logger.error("Erro ao salvar agendamento: ", e);
            return ResponseEntity.internalServerError().body("Erro ao salvar agendamento: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAppointment(@PathVariable("id") String id) {
        try {
            return appointmentRepository.findById(id)
                    .map(appointment -> {
                        appointmentRepository.delete(appointment);
                        return ResponseEntity.ok().build();
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            logger.error("Erro ao excluir agendamento: ", e);
            return ResponseEntity.internalServerError().body("Erro ao excluir agendamento: " + e.getMessage());
        }
    }
}
