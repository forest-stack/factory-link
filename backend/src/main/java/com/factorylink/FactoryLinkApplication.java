package com.factorylink;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

// @EnableScheduling 由 Spring 启动 Java 定时器，模拟数据与 Web 请求使用独立线程。
@EnableScheduling
@SpringBootApplication
public class FactoryLinkApplication {
    public static void main(String[] args) {
        SpringApplication.run(FactoryLinkApplication.class, args);
    }
}
