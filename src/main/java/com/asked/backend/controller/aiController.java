package com.asked.backend.controller;

import com.asked.backend.dto.QuizRequest;
import com.asked.backend.dto.SummarizeRequest;
import com.asked.backend.services.openRouterservice;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.IOException;

@RestController
@RequestMapping("/ai")
public class aiController {

    @Autowired
    private openRouterservice openRouterservice;

    private static final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads/";

    @PostMapping("/summarize")
    public ResponseEntity<?> summarize(@RequestBody SummarizeRequest request) {
        try {
            String summary = openRouterservice.summarizeText(request.getInputText());
            return ResponseEntity.ok(summary);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\":\"Summarization failed: " + e.getMessage() + "\"}");
        }
    }

    @PostMapping("/quiz")
    public ResponseEntity<?> generateQuiz(@RequestBody QuizRequest request) {
        try {
            String quiz = openRouterservice.generateQuizFromText(request.getInputText());
            return ResponseEntity.ok(quiz);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\":\"Quiz generation failed: " + e.getMessage() + "\"}");
        }
    }

    @GetMapping("/flashcards")
    public ResponseEntity<String> aiFlashcards(@RequestParam("filename") String filename) {
        File file = new File(UPLOAD_DIR + filename);

        if (!file.exists()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("File not found");
        }

        try {
            PDDocument document = PDDocument.load(file);
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            document.close();

            String aiResponse = openRouterservice.getFlashcardsFromText(text);
            return ResponseEntity.ok(aiResponse);

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("AI flashcard generation failed");
        }
    }
}
