package com.athis.userservice.controller;

import com.athis.common.dto.request.PageRequestApi;
import com.athis.common.dto.response.PageResponseApi;
import com.athis.common.dto.response.ResponseApi;
import com.athis.userservice.dto.request.UserRequest;
import com.athis.userservice.dto.response.UserResponse;
import com.athis.userservice.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}")
    public ResponseApi<UserResponse> getById(@PathVariable Long id) {
        return ResponseApi.success(userService.getById(id));
    }

    @GetMapping("/account/{accountId}")
    public ResponseApi<UserResponse> getByAccountId(@PathVariable Long accountId) {
        return ResponseApi.success(userService.getByAccountId(accountId));
    }

    @GetMapping("/current/{accountId}")
    public ResponseApi<UserResponse> getCurrentUser(@PathVariable Long accountId) {
        return ResponseApi.success(userService.getCurrentUser(accountId));
    }

    @GetMapping
    public ResponseApi<List<UserResponse>> getAll() {
        return ResponseApi.success(userService.getAll());
    }

    @GetMapping("/page")
    public ResponseApi<PageResponseApi<UserResponse>> getAll(@ModelAttribute PageRequestApi request) {
        return ResponseApi.success(userService.getAll(request));
    }

    @PostMapping
    public ResponseApi<UserResponse> create(@RequestBody UserRequest request) {
        return ResponseApi.success(userService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseApi<UserResponse> update(@PathVariable Long id, @RequestBody UserRequest request) {
        return ResponseApi.success(userService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseApi<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        return ResponseApi.success();
    }

    @PatchMapping("/{id}/status")
    public ResponseApi<Void> updateStatus(@PathVariable Long id, @RequestParam String status) {
        userService.updateStatus(id, status);
        return ResponseApi.success();
    }
}