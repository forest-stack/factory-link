package com.factorylink.repository;

import com.factorylink.entity.OperatorAccount;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OperatorRepository extends JpaRepository<OperatorAccount, String> {
}
