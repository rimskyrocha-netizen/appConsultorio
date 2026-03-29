package com.odontologia.model;

import jakarta.persistence.*;

@Entity
@Table(name = "supplies")
public class Supply {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String category;

    @Column(name = "current_stock", nullable = false)
    private Integer currentStock;

    @Column(name = "min_stock", nullable = false)
    private Integer minStock;

    @Column(nullable = false)
    private String unit;

    @Column(name = "last_purchase_date")
    private String lastPurchaseDate;

    private String supplier;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Integer getCurrentStock() { return currentStock; }
    public void setCurrentStock(Integer currentStock) { this.currentStock = currentStock; }

    public Integer getMinStock() { return minStock; }
    public void setMinStock(Integer minStock) { this.minStock = minStock; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public String getLastPurchaseDate() { return lastPurchaseDate; }
    public void setLastPurchaseDate(String lastPurchaseDate) { this.lastPurchaseDate = lastPurchaseDate; }

    public String getSupplier() { return supplier; }
    public void setSupplier(String supplier) { this.supplier = supplier; }
}
