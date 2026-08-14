package com.athis.userservice.dto.request;

import com.athis.common.enums.CommonStatus;
import com.athis.userservice.enums.Gender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRequest {
    private Long accountId;
    private String fullName;
    private String email;
    private String phone;
    private String avatar;
    private LocalDate dateOfBirth;
    private Gender gender;
    private String address;
    private CommonStatus status;
}
