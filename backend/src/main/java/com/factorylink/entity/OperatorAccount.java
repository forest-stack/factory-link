package com.factorylink.entity;

import jakarta.persistence.*;

/** 数据库中只保存密码哈希，认证时由 BCrypt 校验输入。 */
@Entity
@Table(name = "operator_account")
public class OperatorAccount {
    @Id
    @Column(length = 80)
    private String username;

    @Column(nullable = false, length = 100)
    private String passwordHash;

    protected OperatorAccount() {
    }

    public OperatorAccount(String username, String passwordHash) {
        this.username = username;
        this.passwordHash = passwordHash;
    }

    public String getPasswordHash() { return passwordHash; }
}
