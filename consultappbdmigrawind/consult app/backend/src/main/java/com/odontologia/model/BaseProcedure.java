package com.odontologia.model;

import jakarta.persistence.*;

@Entity
@Table(name = "procedures_catalog")
public class BaseProcedure {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "text")
    private String description;

    @Column(nullable = false)
    private String category;

    @Column(name = "default_value", nullable = false)
    private Double defaultValue;

    @Column(name = "estimated_minutes", nullable = false)
    private Integer estimatedMinutes;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Double getDefaultValue() { return defaultValue; }
    public void setDefaultValue(Double defaultValue) { this.defaultValue = defaultValue; }

    public Integer getEstimatedMinutes() { return estimatedMinutes; }
    public void setEstimatedMinutes(Integer estimatedMinutes) { this.estimatedMinutes = estimatedMinutes; }
}
