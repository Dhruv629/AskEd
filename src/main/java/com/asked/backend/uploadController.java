package com.asked.backend;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
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
import java.util.List;

@RestController
public class uploadController {

    private static final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads/";

    @PostMapping("/upload")
    public ResponseEntity<String> uploadPDF(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            System.out.println("Received an empty file.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("File is empty");
        }

        try {
            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            String filePath = UPLOAD_DIR + file.getOriginalFilename();
            file.transferTo(new File(filePath));

            System.out.println("Uploaded file: " + file.getOriginalFilename());
            return ResponseEntity.ok("File uploaded successfully: " + file.getOriginalFilename());
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload file");
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

    @GetMapping("/flashcards")
    public ResponseEntity<List<flashcard>> generateFlashcards(@RequestParam("filename") String filename) {
        File file = new File(UPLOAD_DIR + filename);

        if (!file.exists()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        try {
            PDDocument document = PDDocument.load(file);
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            document.close();

            List<flashcard> flashcards = new ArrayList<>();

            // Basic sentence split logic (enhance later)
            String[] sentences = text.split("\\. ");
            for (String sentence : sentences) {
                if (sentence.length() > 30) {
                    flashcards.add(new flashcard("What is: " + sentence.substring(0, 20) + "...?", sentence.trim()));
                }
            }

            return ResponseEntity.ok(flashcards);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }

    }

    @GetMapping("/ai-flashcards")
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

    @PostMapping("/save-flashcards")
    public ResponseEntity<String> saveFlashcards(@RequestBody String flashcardsJson) {
        try {
            // Generate a unique filename with timestamp
            String filename = "flashcards_" + System.currentTimeMillis() + ".json";
            Path path = Paths.get("flashcards/" + filename);

            // Save JSON string to file
            Files.write(path, flashcardsJson.getBytes());

            return ResponseEntity.ok("Flashcards saved as " + filename);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to save flashcards");
        }
    }




}
