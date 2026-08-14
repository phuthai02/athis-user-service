package com.athis.userservice.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRequest {
    private Long accountId;
    private String fullName;
    private String phone;
    private String avatar;
    private LocalDateTime dateOfBirth;
    private String gender;
    private String address;
    private String status;
}
