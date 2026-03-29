package com.odontologia.repository;

import com.odontologia.model.TreatmentProcedure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TreatmentProcedureRepository extends JpaRepository<TreatmentProcedure, String> {
    List<TreatmentProcedure> findByPatientId(String patientId);
}
