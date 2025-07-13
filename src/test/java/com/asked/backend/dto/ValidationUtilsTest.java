package com.asked.backend.dto;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class ValidationUtilsTest {

    @Test
    void testValidEmail() {
        assertTrue(ValidationUtils.isValidEmail("test@example.com"));
        assertTrue(ValidationUtils.isValidEmail("user.name@domain.co.uk"));
        assertTrue(ValidationUtils.isValidEmail("test+tag@example.org"));
    }

    @Test
    void testInvalidEmail() {
        assertFalse(ValidationUtils.isValidEmail("invalid-email"));
        assertFalse(ValidationUtils.isValidEmail("test@"));
        assertFalse(ValidationUtils.isValidEmail("@example.com"));
        assertFalse(ValidationUtils.isValidEmail(""));
        assertFalse(ValidationUtils.isValidEmail(null));
    }

    @Test
    void testValidUsername() {
        assertTrue(ValidationUtils.isValidUsername("testuser"));
        assertTrue(ValidationUtils.isValidUsername("user123"));
        assertTrue(ValidationUtils.isValidUsername("test_user"));
        assertTrue(ValidationUtils.isValidUsername("abc")); // Minimum length
        assertTrue(ValidationUtils.isValidUsername("a".repeat(20))); // Maximum length
    }

    @Test
    void testInvalidUsername() {
        assertFalse(ValidationUtils.isValidUsername("ab")); // Too short
        assertFalse(ValidationUtils.isValidUsername("a".repeat(21))); // Too long
        assertFalse(ValidationUtils.isValidUsername("test-user")); // Hyphen not allowed
        assertFalse(ValidationUtils.isValidUsername("test user")); // Space not allowed
        assertFalse(ValidationUtils.isValidUsername(""));
        assertFalse(ValidationUtils.isValidUsername(null));
    }

    @Test
    void testValidPassword() {
        assertTrue(ValidationUtils.isValidPassword("password123"));
        assertTrue(ValidationUtils.isValidPassword("123456")); // Minimum length
        assertTrue(ValidationUtils.isValidPassword("P@ssw0rd!"));
        assertTrue(ValidationUtils.isValidPassword("a".repeat(100))); // Long password
    }

    @Test
    void testInvalidPassword() {
        assertFalse(ValidationUtils.isValidPassword("12345")); // Too short
        assertFalse(ValidationUtils.isValidPassword(""));
        assertFalse(ValidationUtils.isValidPassword(null));
    }

    @Test
    void testValidPdfFile() {
        assertTrue(ValidationUtils.isValidPdfFile("document.pdf"));
        assertTrue(ValidationUtils.isValidPdfFile("test.PDF"));
        assertTrue(ValidationUtils.isValidPdfFile("file-name.pdf"));
        assertTrue(ValidationUtils.isValidPdfFile("document123.pdf"));
    }

    @Test
    void testInvalidPdfFile() {
        assertFalse(ValidationUtils.isValidPdfFile("document.txt"));
        assertFalse(ValidationUtils.isValidPdfFile("document.doc"));
        assertFalse(ValidationUtils.isValidPdfFile("document"));
        assertFalse(ValidationUtils.isValidPdfFile(""));
        assertFalse(ValidationUtils.isValidPdfFile(null));
    }

    @Test
    void testSanitizeText() {
        assertEquals("Hello World", ValidationUtils.sanitizeText("Hello World"));
        assertEquals("Hello World", ValidationUtils.sanitizeText("  Hello World  "));
        assertEquals("Hello World", ValidationUtils.sanitizeText("<script>alert('xss')</script>Hello World"));
        assertEquals("Hello World", ValidationUtils.sanitizeText("Hello <b>World</b>"));
        assertEquals("", ValidationUtils.sanitizeText("<script></script>"));
        assertNull(ValidationUtils.sanitizeText(null));
    }

    @Test
    void testValidTextLength() {
        assertTrue(ValidationUtils.isValidTextLength("Hello", 10));
        assertTrue(ValidationUtils.isValidTextLength("Hello", 5));
        assertTrue(ValidationUtils.isValidTextLength("Test", 10));
        
        assertFalse(ValidationUtils.isValidTextLength("Hello World", 5));
        assertFalse(ValidationUtils.isValidTextLength(null, 10));
        assertFalse(ValidationUtils.isValidTextLength("", 10)); // Empty string should fail
        assertFalse(ValidationUtils.isValidTextLength("", 0));
    }

    @Test
    void testValidFileSize() {
        assertTrue(ValidationUtils.isValidFileSize(1024, 2048));
        assertTrue(ValidationUtils.isValidFileSize(1024, 1024));
        assertTrue(ValidationUtils.isValidFileSize(1, 1024));
        
        assertFalse(ValidationUtils.isValidFileSize(2048, 1024));
        assertFalse(ValidationUtils.isValidFileSize(0, 1024));
        assertFalse(ValidationUtils.isValidFileSize(-1, 1024));
    }

    @Test
    void testGetValidationErrorMessage() {
        assertEquals("Validation failed for email: Invalid format", 
            ValidationUtils.getValidationErrorMessage("email", "Invalid format"));
        assertEquals("Validation failed for username: Too short", 
            ValidationUtils.getValidationErrorMessage("username", "Too short"));
    }
} 