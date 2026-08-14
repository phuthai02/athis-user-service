package com.athis.userservice.controller;

import com.athis.common.dto.request.PageRequestApi;
import com.athis.common.dto.response.PageResponseApi;
import com.athis.common.dto.response.ResponseApi;
import com.athis.common.enums.CommonStatus;
import com.athis.userservice.dto.request.UserRequest;
import com.athis.userservice.dto.response.UserResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Users", description = "User management APIs")
@RequestMapping("/users")
public interface UserController {

    @Operation(summary = "Get user by ID")
    @GetMapping("/{id}")
    ResponseApi<UserResponse> getById(
            @PathVariable Long id
    );

    @Operation(summary = "Get user by account ID")
    @GetMapping("/account/{accountId}")
    ResponseApi<UserResponse> getByAccountId(
            @PathVariable Long accountId
    );

    @Operation(summary = "Get current user")
    @GetMapping("/current/{accountId}")
    ResponseApi<UserResponse> getCurrentUser(
            @PathVariable Long accountId
    );

    @Operation(summary = "Get all users")
    @GetMapping
    ResponseApi<List<UserResponse>> getAll();

    @Operation(summary = "Get users with pagination")
    @GetMapping("/page")
    ResponseApi<PageResponseApi<UserResponse>> getAll(
            @ModelAttribute PageRequestApi request
    );

    @Operation(summary = "Create user")
    @PostMapping
    ResponseApi<UserResponse> create(
            @RequestBody UserRequest request
    );

    @Operation(summary = "Update user")
    @PutMapping("/{id}")
    ResponseApi<UserResponse> update(
            @PathVariable Long id,
            @RequestBody UserRequest request
    );

    @Operation(summary = "Delete user")
    @DeleteMapping("/{id}")
    ResponseApi<Void> delete(
            @PathVariable Long id
    );

    @Operation(summary = "Update user status")
    @PatchMapping("/{id}/status")
    ResponseApi<Void> updateStatus(
            @PathVariable Long id,
            @RequestParam CommonStatus status
    );
}