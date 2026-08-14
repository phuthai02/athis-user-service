package com.athis.userservice.service;

import com.athis.common.dto.request.PageRequestApi;
import com.athis.common.dto.response.PageResponseApi;
import com.athis.common.enums.CommonStatus;
import com.athis.userservice.dto.request.UserRequest;
import com.athis.userservice.dto.response.UserResponse;
import com.athis.userservice.entity.User;
import com.athis.userservice.exception.UserNotFoundException;
import com.athis.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserResponse getById(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new UserNotFoundException(id)
                );

        return toResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getByAccountId(Long accountId) {

        User user = userRepository.findByAccountId(accountId)
                .orElseThrow(() ->
                        new UserNotFoundException("User not found with accountId: " + accountId)
                );

        return toResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(Long accountId) {
        return getByAccountId(accountId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAll() {

        return userRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponseApi<UserResponse> getAll(PageRequestApi request) {

        Pageable pageable = PageRequest.of(
                request.getPageNo(),
                request.getPageSize()
        );

        Page<User> page = userRepository.findAll(pageable);

        List<UserResponse> content = page.getContent()
                .stream()
                .map(this::toResponse)
                .toList();

        return PageResponseApi.of(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages()
        );
    }

    @Override
    public UserResponse create(UserRequest request) {

        if (userRepository.existsByAccountId(request.getAccountId())) {
            throw new RuntimeException(
                    "User already exists with accountId: "
                            + request.getAccountId()
            );
        }

        User user = User.builder()
                .accountId(request.getAccountId())
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .avatar(request.getAvatar())
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .address(request.getAddress())
                .status(CommonStatus.valueOf(request.getStatus()))
                .build();

        User savedUser = userRepository.save(user);

        log.info(
                "Created user: id={}, accountId={}",
                savedUser.getId(),
                savedUser.getAccountId()
        );

        return toResponse(savedUser);
    }

    @Override
    public UserResponse update(Long id, UserRequest request) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new UserNotFoundException(id)
                );

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setAvatar(request.getAvatar());
        user.setDateOfBirth(request.getDateOfBirth());
        user.setGender(request.getGender());
        user.setAddress(request.getAddress());

        if (request.getStatus() != null) {
            user.setStatus(CommonStatus.valueOf(request.getStatus()));
        }

        User updatedUser = userRepository.save(user);

        log.info("Updated user: id={}", id);

        return toResponse(updatedUser);
    }

    @Override
    public void delete(Long id) {

        if (!userRepository.existsById(id)) {
            throw new UserNotFoundException(id);
        }

        userRepository.deleteById(id);

        log.info("Deleted user: id={}", id);
    }

    @Override
    public void updateStatus(Long id, String status) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new UserNotFoundException(id)
                );

        user.setStatus(CommonStatus.valueOf(status));

        userRepository.save(user);

        log.info(
                "Updated user status: id={}, status={}",
                id,
                status
        );
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .accountId(user.getAccountId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .avatar(user.getAvatar())
                .dateOfBirth(user.getDateOfBirth())
                .gender(user.getGender())
                .address(user.getAddress())
                .status(user.getStatus().getValue())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
