package com.athis.userservice.exception;

import com.athis.common.dto.response.ResponseApi;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ResponseApi<Void> handleException(Exception e) {
        return ResponseApi.error(e.getMessage());
    }

    @ExceptionHandler(UserNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ResponseApi<Void> handleUserNotFoundException(UserNotFoundException e) {
        return ResponseApi.error(e.getMessage());
    }
}