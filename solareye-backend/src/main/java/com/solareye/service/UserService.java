package com.solareye.service;

import com.solareye.dto.LoginRequest;
import com.solareye.dto.LoginResponse;

public interface UserService {

    /**
     * Authenticate a user with email and password.
     */
    LoginResponse authenticate(LoginRequest request);

    /**
     * Get currently authenticated user info.
     */
    LoginResponse getCurrentUser(String email);
}
