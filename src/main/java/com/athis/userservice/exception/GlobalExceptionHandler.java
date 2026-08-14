package com.athis.userservice.exception;

import com.athis.common.dto.response.ResponseApi;
import com.athis.common.exception.ResourceAlreadyExistsException;
import com.athis.common.exception.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ResponseApi<Void> handleResourceNotFound(ResourceNotFoundException e) {
        return ResponseApi.error(e.getMessage());
    }

    @ExceptionHandler(ResourceAlreadyExistsException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ResponseApi<Void> handleResourceAlreadyExists(ResourceAlreadyExistsException e) {
        return ResponseApi.error(e.getMessage());
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ResponseApi<Void> handleException(Exception e) {
        return ResponseApi.error(e.getMessage());
    }
}