package com.solareye.controller;

import com.solareye.dto.ApiResponse;
import com.solareye.dto.LoginRequest;
import com.solareye.dto.LoginResponse;
import com.solareye.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "User login, logout, and session management")
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;

    @PostMapping("/login")
    @Operation(summary = "User login",
            description = "Authenticates a user with email and password. Creates an HTTP session.")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request, HttpSession session) {

        // Authenticate via Spring Security
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Get user details
        LoginResponse response = userService.authenticate(request);

        // Store in session
        session.setAttribute("user", response);

        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/logout")
    @Operation(summary = "User logout",
            description = "Invalidates the current session and logs out the user.")
    public ResponseEntity<ApiResponse<String>> logout(HttpSession session) {
        session.invalidate();
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(ApiResponse.success("Logout successful", "Session terminated"));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user",
            description = "Returns information about the currently authenticated user.")
    public ResponseEntity<ApiResponse<LoginResponse>> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("Not authenticated"));
        }
        LoginResponse response = userService.getCurrentUser(auth.getName());
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
