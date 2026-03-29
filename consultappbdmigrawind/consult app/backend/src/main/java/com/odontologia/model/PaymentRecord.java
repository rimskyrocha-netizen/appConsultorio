package com.odontologia.model;

import jakarta.persistence.*;

@Entity
@Table(name = "payment_records")
public class PaymentRecord {

    @Id
    private String id;

    @Column(name = "patient_id", nullable = false)
    private String patientId;

    @Column(nullable = false)
    private String date;

    @Column(nullable = false)
    private Double value;

    @Column(nullable = false)
    private String method;

    @Column(nullable = false)
    private String status;

    @Column(columnDefinition = "text")
    private String notes;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public Double getValue() { return value; }
    public void setValue(Double value) { this.value = value; }

    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
