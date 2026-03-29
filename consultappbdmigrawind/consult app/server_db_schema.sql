CREATE TABLE IF NOT EXISTS tenants (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    tenant_id VARCHAR(36) NOT NULL,
    specialty VARCHAR(255),
    status VARCHAR(20) NOT NULL,
    last_access DATETIME,
    cro VARCHAR(20),
    state VARCHAR(2),
    city VARCHAR(255),
    password VARCHAR(255),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS patients (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cpf VARCHAR(20) UNIQUE NOT NULL,
    birth_date DATE,
    phone VARCHAR(20),
    whatsapp VARCHAR(20),
    email VARCHAR(255),
    last_visit DATETIME,
    tags JSON,
    medical_history TEXT,
    insurance_name VARCHAR(255),
    insurance_card VARCHAR(50),
    observations TEXT
);

CREATE TABLE IF NOT EXISTS procedures_catalog (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    default_value DECIMAL(10, 2),
    estimated_minutes INT
);

CREATE TABLE IF NOT EXISTS appointments (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36) NOT NULL,
    dentist_id VARCHAR(36) NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    notes TEXT,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (dentist_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS treatment_plans (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36) NOT NULL,
    description TEXT,
    total_value DECIMAL(10, 2),
    status VARCHAR(50) NOT NULL,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
);

CREATE TABLE IF NOT EXISTS treatment_procedures (
    id VARCHAR(36) PRIMARY KEY,
    treatment_plan_id VARCHAR(36) NOT NULL,
    tooth_number INT,
    face VARCHAR(10),
    description TEXT,
    value DECIMAL(10, 2),
    status VARCHAR(50) NOT NULL,
    FOREIGN KEY (treatment_plan_id) REFERENCES treatment_plans(id)
);
