package com.asked.backend.controller;

import com.asked.backend.model.flashcard;
import com.asked.backend.services.OpenRouterService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.asked.backend.dto.ValidationUtils;

import static com.asked.backend.utils.fileStoragePaths.UPLOAD_DIR;


@RestController
public class uploadController {
    @Autowired
    private OpenRouterService openRouterservice;


    @PostMapping("/upload")
    public ResponseEntity<?> uploadPDF(@RequestParam("file") MultipartFile file) {
        try {
            // Validate file
            if (file.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("error", "File is empty");
                response.put("timestamp", System.currentTimeMillis());
                return ResponseEntity.badRequest().body(response);
            }

            // Validate file type
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || !ValidationUtils.isValidPdfFile(originalFilename)) {
                Map<String, Object> response = new HashMap<>();
                response.put("error", "Invalid file type");
                response.put("message", "Only PDF files are allowed");
                response.put("timestamp", System.currentTimeMillis());
                return ResponseEntity.badRequest().body(response);
            }

            // Validate file size (10MB limit)
            if (!ValidationUtils.isValidFileSize(file.getSize(), 10 * 1024 * 1024)) {
                Map<String, Object> response = new HashMap<>();
                response.put("error", "File too large");
                response.put("message", "File size must be less than 10MB");
                response.put("timestamp", System.currentTimeMillis());
                return ResponseEntity.badRequest().body(response);
            }

            // Sanitize filename
            String sanitizedFilename = ValidationUtils.sanitizeText(originalFilename);
            if (sanitizedFilename == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("error", "Invalid filename");
                response.put("timestamp", System.currentTimeMillis());
                return ResponseEntity.badRequest().body(response);
            }

            // Create upload directory
            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            // Save file with sanitized name
            String filePath = UPLOAD_DIR + sanitizedFilename;
            file.transferTo(new File(filePath));

            Map<String, Object> response = new HashMap<>();
            response.put("message", "File uploaded successfully");
            response.put("filename", sanitizedFilename);
            response.put("size", file.getSize());
            response.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.ok(response);
        } catch (IOException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", "Upload failed");
            response.put("message", "Failed to save file");
            response.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/extract")
    public ResponseEntity<String> extractText(@RequestParam("filename") String filename) {
        File file = new File(UPLOAD_DIR + filename);

        if (!file.exists()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("File not found: " + filename);
        }

        try {
            PDDocument document = PDDocument.load(file);
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            document.close();

            return ResponseEntity.ok("Extracted text:\n" + text);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to extract text");
        }
    }

}
