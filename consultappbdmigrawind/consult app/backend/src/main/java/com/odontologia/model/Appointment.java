package com.odontologia.model;

import jakarta.persistence.*;

@Entity
@Table(name = "appointments")
public class Appointment {

    @Id
    private String id;

    @Column(name = "patient_name", nullable = false)
    private String patientName;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private String time; // No formato "08:00"

    @Column(nullable = false)
    private String date; // No formato "YYYY-MM-DD"

    @Column(name = "dentist_id")
    private String dentistId;

    private String color;
    private String textColor;
    private String bgColor;

    @Column(name = "is_block")
    private boolean isBlock;

    // Getters and Setters

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getDentistId() { return dentistId; }
    public void setDentistId(String dentistId) { this.dentistId = dentistId; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getTextColor() { return textColor; }
    public void setTextColor(String textColor) { this.textColor = textColor; }

    public String getBgColor() { return bgColor; }
    public void setBgColor(String bgColor) { this.bgColor = bgColor; }

    public boolean isBlock() { return isBlock; }
    public void setBlock(boolean block) { isBlock = block; }
}
