package com.factorylink.dto;

import java.util.List;
import org.springframework.data.domain.Page;

// 自己定义分页响应，避免前端依赖 Spring Data 的内部序列化格式。
public record PageResult<T>(List<T> items, long total) {
    public static <T> PageResult<T> from(Page<T> page) {
        return new PageResult<>(page.getContent(), page.getTotalElements());
    }
}
