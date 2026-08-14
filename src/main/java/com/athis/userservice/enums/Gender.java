package com.athis.userservice.enums;

import lombok.Getter;

@Getter
public enum Gender {

    MALE("MALE"),
    FEMALE("FEMALE"),
    OTHER("OTHER");

    private final String value;

    Gender(String value) {
        this.value = value;
    }
}
