package com.athis.userservice.dto.response;

import com.athis.common.enums.CommonStatus;
import com.athis.userservice.enums.Gender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private Long accountId;
    private String fullName;
    private String email;
    private String phone;
    private String avatar;
    private LocalDate dateOfBirth;
    private Gender gender;
    private String address;
    private CommonStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
