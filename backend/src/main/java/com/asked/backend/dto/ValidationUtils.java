package com.asked.backend.dto;

import org.springframework.stereotype.Component;
import java.util.regex.Pattern;

@Component
public class ValidationUtils {
    
    // Email validation pattern
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
    );
    
    // Username validation pattern (alphanumeric, 3-20 characters)
    private static final Pattern USERNAME_PATTERN = Pattern.compile(
        "^[a-zA-Z0-9_]{3,20}$"
    );
    
    // Password validation pattern (at least 6 characters, alphanumeric + special chars)
    private static final Pattern PASSWORD_PATTERN = Pattern.compile(
        "^.{6,}$"
    );
    
    // File extension validation for PDFs
    private static final Pattern PDF_EXTENSION_PATTERN = Pattern.compile(
        "\\.pdf$", Pattern.CASE_INSENSITIVE
    );
    
    /**
     * Validate email format
     */
    public static boolean isValidEmail(String email) {
        return email != null && EMAIL_PATTERN.matcher(email).matches();
    }
    
    /**
     * Validate username format
     */
    public static boolean isValidUsername(String username) {
        return username != null && USERNAME_PATTERN.matcher(username).matches();
    }
    
    /**
     * Validate password strength
     */
    public static boolean isValidPassword(String password) {
        return password != null && PASSWORD_PATTERN.matcher(password).matches();
    }
    
    /**
     * Validate PDF file extension
     */
    public static boolean isValidPdfFile(String filename) {
        return filename != null && PDF_EXTENSION_PATTERN.matcher(filename).find();
    }
    
    /**
     * Sanitize text input (remove potentially dangerous characters)
     */
    public static String sanitizeText(String text) {
        if (text == null) return null;
        
        // Remove script tags and other potentially dangerous content
        return text.replaceAll("<script[^>]*>.*?</script>", "")
                  .replaceAll("<[^>]*>", "")
                  .trim();
    }
    
    /**
     * Validate text length for AI processing
     */
    public static boolean isValidTextLength(String text, int maxLength) {
        return text != null && text.length() <= maxLength && text.length() > 0;
    }
    
    /**
     * Validate file size (in bytes)
     */
    public static boolean isValidFileSize(long fileSize, long maxSizeBytes) {
        return fileSize > 0 && fileSize <= maxSizeBytes;
    }
    
    /**
     * Get validation error message
     */
    public static String getValidationErrorMessage(String field, String reason) {
        return String.format("Validation failed for %s: %s", field, reason);
    }
} 