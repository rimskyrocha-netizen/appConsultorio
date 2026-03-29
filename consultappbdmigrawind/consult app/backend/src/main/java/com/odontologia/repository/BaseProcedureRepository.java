package com.odontologia.repository;

import com.odontologia.model.BaseProcedure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BaseProcedureRepository extends JpaRepository<BaseProcedure, String> {
}
