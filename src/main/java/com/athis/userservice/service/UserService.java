package com.athis.userservice.service;

import com.athis.common.dto.request.PageRequestApi;
import com.athis.common.dto.response.PageResponseApi;
import com.athis.userservice.dto.request.UserRequest;
import com.athis.userservice.dto.response.UserResponse;

import java.util.List;

public interface UserService {
    UserResponse getById(Long id);
    UserResponse getByAccountId(Long accountId);
    UserResponse getCurrentUser(Long accountId);
    List<UserResponse> getAll();
    PageResponseApi<UserResponse> getAll(PageRequestApi request);
    UserResponse create(UserRequest request);
    UserResponse update(Long id, UserRequest request);
    void delete(Long id);
    void updateStatus(Long id, String status);
}
