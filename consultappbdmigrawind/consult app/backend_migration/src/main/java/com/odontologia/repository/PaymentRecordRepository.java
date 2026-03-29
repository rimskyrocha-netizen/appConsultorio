package com.odontologia.repository;

import com.odontologia.model.PaymentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PaymentRecordRepository extends JpaRepository<PaymentRecord, String> {
    List<PaymentRecord> findByPatientId(String patientId);
}
