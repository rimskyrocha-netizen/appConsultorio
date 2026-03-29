package com.odontologia.model;

import jakarta.persistence.*;

@Entity
@Table(name = "notices")
public class Notice {

    @Id
    private String id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "text")
    private String description;

    @Column(nullable = false)
    private String category; // CLINICA, FINANCEIRA, ADMINISTRATIVA, OUTRA

    @Column(nullable = false)
    private String priority; // BAIXA, MEDIA, ALTA, URGENTE

    @Column(nullable = false)
    private String date;

    @Column(nullable = false)
    private String status; // PENDENTE, CONCLUIDO

    @Column(name = "created_at", nullable = false)
    private String createdAt;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
