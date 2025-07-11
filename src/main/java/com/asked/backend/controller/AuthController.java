package com.asked.backend.controller;

import com.asked.backend.dto.AuthResponse;
import com.asked.backend.dto.LoginRequest;
import com.asked.backend.dto.RegisterRequest;
import com.asked.backend.model.User;
import com.asked.backend.model.UserRepository;
import com.asked.backend.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

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
            // Check if username already exists
            if (userRepository.existsByUsername(request.getUsername())) {
                return ResponseEntity.badRequest().body("Username already exists");
            }

            // Check if email already exists
            if (userRepository.existsByEmail(request.getEmail())) {
                return ResponseEntity.badRequest().body("Email already exists");
            }

            // Create new user with encrypted password
            User user = new User(
                request.getUsername(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword())
            );

            userRepository.save(user);

            // Generate JWT token
            String token = jwtUtil.generateToken(user.getUsername());

            return ResponseEntity.ok(new AuthResponse(token, user.getUsername()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Registration failed: " + e.getMessage());
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
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String authHeader) {
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