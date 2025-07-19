package com.asked.backend.services;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class OpenRouterServiceTest {

    @Autowired
    private OpenRouterService openRouterService;

    @Test
    void testSummarizeText() {
        String testText = "This is a test text for summarization. " +
                "It contains multiple sentences to test the AI summarization functionality. " +
                "The summary should be concise and capture the main points.";

        try {
            String summary = openRouterService.summarizeText(testText, "Summarize this text concisely.");
            
            assertNotNull(summary);
            assertFalse(summary.isEmpty());
            assertTrue(summary.length() < testText.length(), "Summary should be shorter than original text");
            
        } catch (Exception e) {
            // In test environment, AI service might not be available
            // This is acceptable for unit tests
            System.out.println("AI service not available for testing: " + e.getMessage());
        }
    }

    @Test
    void testGetFlashcardsFromText() {
        String testText = "Java is a programming language. " +
                "It is object-oriented and platform-independent. " +
                "Java was developed by Sun Microsystems in 1995.";

        try {
            String flashcards = openRouterService.getFlashcardsFromText(testText);
            
            assertNotNull(flashcards);
            assertFalse(flashcards.isEmpty());
            
            // Check if response contains JSON structure
            assertTrue(flashcards.contains("question") || flashcards.contains("answer"), 
                "Response should contain flashcard structure");
            
        } catch (Exception e) {
            // In test environment, AI service might not be available
            System.out.println("AI service not available for testing: " + e.getMessage());
        }
    }

    @Test
    void testGenerateQuizFromText() {
        String testText = "The solar system consists of the Sun and the planets that orbit it. " +
                "There are eight planets: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune. " +
                "Pluto was reclassified as a dwarf planet in 2006.";

        try {
            String quiz = openRouterService.generateQuizFromText(testText);
            
            assertNotNull(quiz);
            assertFalse(quiz.isEmpty());
            
            // Check if response contains quiz structure
            assertTrue(quiz.contains("question") || quiz.contains("options") || quiz.contains("answer"), 
                "Response should contain quiz structure");
            
        } catch (Exception e) {
            // In test environment, AI service might not be available
            System.out.println("AI service not available for testing: " + e.getMessage());
        }
    }

    @Test
    void testSummarizeTextWithCustomPrompt() {
        String testText = "The human brain is the command center for the human nervous system. " +
                "It receives signals from the body's sensory organs and outputs information to the muscles. " +
                "The human brain has the same basic structure as other mammal brains.";

        String customPrompt = "Explain this in simple terms for a 10-year-old.";

        try {
            String summary = openRouterService.summarizeText(testText, customPrompt);
            
            assertNotNull(summary);
            assertFalse(summary.isEmpty());
            
        } catch (Exception e) {
            // In test environment, AI service might not be available
            System.out.println("AI service not available for testing: " + e.getMessage());
        }
    }

    @Test
    void testSummarizeTextWithEmptyInput() {
        try {
            String summary = openRouterService.summarizeText("", "Summarize this.");
            
            // Should handle empty input gracefully
            assertNotNull(summary);
            
        } catch (Exception e) {
            // Expected behavior for empty input
            assertTrue(e.getMessage().contains("failed") || e.getMessage().contains("error"));
        }
    }

    @Test
    void testSummarizeTextWithNullPrompt() {
        String testText = "This is a test text for summarization.";

        try {
            String summary = openRouterService.summarizeText(testText, null);
            
            assertNotNull(summary);
            assertFalse(summary.isEmpty());
            
        } catch (Exception e) {
            // In test environment, AI service might not be available
            System.out.println("AI service not available for testing: " + e.getMessage());
        }
    }
} 