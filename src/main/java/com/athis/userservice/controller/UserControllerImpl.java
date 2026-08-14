package com.athis.userservice.controller;

import com.athis.common.dto.request.PageRequestApi;
import com.athis.common.dto.response.PageResponseApi;
import com.athis.common.dto.response.ResponseApi;
import com.athis.userservice.dto.request.UserRequest;
import com.athis.userservice.dto.response.UserResponse;
import com.athis.userservice.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class UserControllerImpl implements UserController {

    private final UserService userService;

    @Override
    public ResponseApi<UserResponse> getById(Long id) {
        return ResponseApi.success(userService.getById(id));
    }

    @Override
    public ResponseApi<UserResponse> getByAccountId(Long accountId) {
        return ResponseApi.success(userService.getByAccountId(accountId));
    }

    @Override
    public ResponseApi<UserResponse> getCurrentUser(Long accountId) {
        return ResponseApi.success(userService.getCurrentUser(accountId));
    }

    @Override
    public ResponseApi<List<UserResponse>> getAll() {
        return ResponseApi.success(userService.getAll());
    }

    @Override
    public ResponseApi<PageResponseApi<UserResponse>> getAll(PageRequestApi request) {
        return ResponseApi.success(userService.getAll(request));
    }

    @Override
    public ResponseApi<UserResponse> create(UserRequest request) {
        return ResponseApi.success(userService.create(request));
    }

    @Override
    public ResponseApi<UserResponse> update(Long id, UserRequest request) {
        return ResponseApi.success(userService.update(id, request));
    }

    @Override
    public ResponseApi<Void> delete(Long id) {
        userService.delete(id);
        return ResponseApi.success();
    }

    @Override
    public ResponseApi<Void> updateStatus(Long id, String status) {
        userService.updateStatus(id, status);
        return ResponseApi.success();
    }
}