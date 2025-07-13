package com.asked.backend.controller;

import com.asked.backend.dto.AuthResponse;
import com.asked.backend.dto.LoginRequest;
import com.asked.backend.dto.RegisterRequest;
import com.asked.backend.dto.ValidationUtils;
import com.asked.backend.model.User;
import com.asked.backend.model.UserRepository;
import com.asked.backend.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            // Input validation
            Map<String, String> validationErrors = new HashMap<>();
            
            if (!ValidationUtils.isValidUsername(request.getUsername())) {
                validationErrors.put("username", "Username must be 3-20 characters long and contain only letters, numbers, and underscores");
            }
            
            if (!ValidationUtils.isValidEmail(request.getEmail())) {
                validationErrors.put("email", "Please provide a valid email address");
            }
            
            if (!ValidationUtils.isValidPassword(request.getPassword())) {
                validationErrors.put("password", "Password must be at least 6 characters long");
            }
            
            if (!validationErrors.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("error", "Validation failed");
                response.put("details", validationErrors);
                response.put("timestamp", System.currentTimeMillis());
                return ResponseEntity.badRequest().body(response);
            }
            
            // Sanitize inputs
            String sanitizedUsername = ValidationUtils.sanitizeText(request.getUsername());
            String sanitizedEmail = ValidationUtils.sanitizeText(request.getEmail());
            
            // Check if username already exists
            if (userRepository.existsByUsername(sanitizedUsername)) {
                Map<String, Object> response = new HashMap<>();
                response.put("error", "Username already exists");
                response.put("timestamp", System.currentTimeMillis());
                return ResponseEntity.badRequest().body(response);
            }

            // Check if email already exists
            if (userRepository.existsByEmail(sanitizedEmail)) {
                Map<String, Object> response = new HashMap<>();
                response.put("error", "Email already exists");
                response.put("timestamp", System.currentTimeMillis());
                return ResponseEntity.badRequest().body(response);
            }

            // Create new user with encrypted password
            User user = new User(
                sanitizedUsername,
                sanitizedEmail,
                passwordEncoder.encode(request.getPassword())
            );

            userRepository.save(user);

            // Generate JWT token
            String token = jwtUtil.generateToken(user.getUsername());

            return ResponseEntity.ok(new AuthResponse(token, user.getUsername()));
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", "Registration failed");
            response.put("message", "An unexpected error occurred during registration");
            response.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            // Find user by username
            User user = userRepository.findByUsername(request.getUsername())
                    .orElse(null);

            if (user == null) {
                return ResponseEntity.badRequest().body("Invalid username or password");
            }

            // Check password
            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                return ResponseEntity.badRequest().body("Invalid username or password");
            }

            // Generate JWT token
            String token = jwtUtil.generateToken(user.getUsername());

            return ResponseEntity.ok(new AuthResponse(token, user.getUsername()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Login failed: " + e.getMessage());
        }
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.badRequest().body("Invalid token format");
            }

            String token = authHeader.substring(7);
            
            if (!jwtUtil.validateToken(token)) {
                return ResponseEntity.badRequest().body("Invalid token");
            }

            if (jwtUtil.isTokenExpired(token)) {
                return ResponseEntity.badRequest().body("Token expired");
            }

            String username = jwtUtil.extractUsername(token);
            return ResponseEntity.ok("Token is valid for user: " + username);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Token validation failed");
        }
    }
} 