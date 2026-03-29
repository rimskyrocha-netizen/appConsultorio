package com.odontologia.model;

import jakarta.persistence.*;

@Entity
@Table(name = "clinic_transactions")
public class ClinicTransaction {

    @Id
    private String id;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private String type; // IN, OUT

    @Column(nullable = false)
    private Double value;

    @Column(nullable = false)
    private String date;

    @Column(nullable = false)
    private String method; // PIX, Boleto, Cartão, Dinheiro

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Double getValue() { return value; }
    public void setValue(Double value) { this.value = value; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }
}
