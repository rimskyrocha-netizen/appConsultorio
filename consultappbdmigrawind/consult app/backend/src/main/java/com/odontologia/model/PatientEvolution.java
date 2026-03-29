package com.odontologia.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "patient_evolutions")
public class PatientEvolution {

    @Id
    private String id;

    @Column(name = "patient_id", nullable = false)
    private String patientId;

    @Column(nullable = false)
    private String date;

    @Column(nullable = false)
    private String professional;

    @Column(columnDefinition = "text")
    private String notes;

    @Convert(converter = StringListConverter.class)
    @Column(columnDefinition = "json")
    private List<String> tags;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getProfessional() { return professional; }
    public void setProfessional(String professional) { this.professional = professional; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
}
