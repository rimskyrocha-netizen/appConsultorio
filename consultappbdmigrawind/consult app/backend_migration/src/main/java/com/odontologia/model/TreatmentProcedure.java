package com.odontologia.model;

import jakarta.persistence.*;

@Entity
@Table(name = "treatment_procedures")
public class TreatmentProcedure {

    @Id
    private String id;

    @Column(name = "patient_id", nullable = false)
    private String patientId;

    private String tooth;
    private String face;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private Double value;

    @Column(nullable = false)
    private String status; // PLANEJADO, REALIZADO, CANCELADO

    @Column(nullable = false)
    private String date;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }

    public String getTooth() { return tooth; }
    public void setTooth(String tooth) { this.tooth = tooth; }

    public String getFace() { return face; }
    public void setFace(String face) { this.face = face; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getValue() { return value; }
    public void setValue(Double value) { this.value = value; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
}
