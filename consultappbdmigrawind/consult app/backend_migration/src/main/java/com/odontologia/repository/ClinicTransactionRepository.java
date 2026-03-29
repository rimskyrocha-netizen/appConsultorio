package com.odontologia.repository;

import com.odontologia.model.ClinicTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClinicTransactionRepository extends JpaRepository<ClinicTransaction, String> {
}
