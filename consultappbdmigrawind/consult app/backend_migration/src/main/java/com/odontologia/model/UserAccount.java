package com.odontologia.model;

import jakarta.persistence.*;

@Entity
@Table(name = "user_accounts")
public class UserAccount {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role; // ADMIN, DENTIST, RECEPTION, FINANCIAL, ASSISTANT, STOCK, AUDITOR, PATIENT

    @Column(name = "tenant_id")
    private String tenantId;

    @Column(nullable = false)
    private String status; // ACTIVE, INACTIVE

    @Column(name = "last_access")
    private String lastAccess;

    private String cro;
    private String state;
    private String city;
    private String specialty;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getLastAccess() { return lastAccess; }
    public void setLastAccess(String lastAccess) { this.lastAccess = lastAccess; }

    public String getCro() { return cro; }
    public void setCro(String cro) { this.cro = cro; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getSpecialty() { return specialty; }
    public void setSpecialty(String specialty) { this.specialty = specialty; }
}
