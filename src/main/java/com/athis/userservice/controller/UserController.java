package com.athis.userservice.controller;

import com.athis.common.dto.request.PageRequestApi;
import com.athis.common.dto.response.PageResponseApi;
import com.athis.common.dto.response.ResponseApi;
import com.athis.common.enums.CommonStatus;
import com.athis.userservice.dto.request.UserRequest;
import com.athis.userservice.dto.response.UserResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Users", description = "User management APIs")
@RequestMapping("/users")
public interface UserController {

    @Operation(summary = "Get user by ID")
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('user:read')")
    ResponseApi<UserResponse> getById(
            @PathVariable Long id
    );

    @Operation(summary = "Get user by account ID")
    @GetMapping("/account/{accountId}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('user:read')")
    ResponseApi<UserResponse> getByAccountId(
            @PathVariable Long accountId
    );

    @Operation(summary = "Get current user")
    @GetMapping("/me")
    ResponseApi<UserResponse> getCurrentUser(
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt
    );

    @Operation(summary = "Get all users")
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('user:list')")
    ResponseApi<List<UserResponse>> getAll();

    @Operation(summary = "Get users with pagination")
    @GetMapping("/page")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('user:list')")
    ResponseApi<PageResponseApi<UserResponse>> getAll(
            @ModelAttribute PageRequestApi request
    );

    @Operation(summary = "Create user")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('user:create')")
    ResponseApi<UserResponse> create(
            @Valid @RequestBody UserRequest request
    );

    @Operation(summary = "Update user")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('user:update')")
    ResponseApi<UserResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UserRequest request
    );

    @Operation(summary = "Delete user")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('user:delete')")
    ResponseApi<Void> delete(
            @PathVariable Long id
    );

    @Operation(summary = "Update user status")
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('user:status:update')")
    ResponseApi<Void> updateStatus(
            @PathVariable Long id,
            @RequestParam CommonStatus status
    );
}
