package com.factorylink.controller;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;

/** 错误响应使用固定 JSON 结构，Axios 直接读取 message 显示日语提示。 */
@RestControllerAdvice
public class ApiExceptionHandler {
    public record ApiError(String message) {}

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiError> status(ResponseStatusException error) {
        return ResponseEntity.status(error.getStatusCode()).body(new ApiError(error.getReason()));
    }

    @ExceptionHandler({
        MethodArgumentNotValidException.class, HandlerMethodValidationException.class,
        HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class
    })
    public ResponseEntity<ApiError> invalidInput() {
        return ResponseEntity.badRequest().body(new ApiError("入力内容を確認してください。"));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> conflict() {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(new ApiError("既存のデータと競合しました。設備番号などを確認してください。"));
    }
}
