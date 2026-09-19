package com.solareye.dto;

import lombok.*;

/**
 * Login response payload with user info.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {

    private Long id;
    private String name;
    private String email;
    private String role;
    private String message;
}
