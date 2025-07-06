package com.asked.backend.controller;

import com.asked.backend.model.flashcard;
import com.asked.backend.services.openRouterservice;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

import static com.asked.backend.utils.fileStoragePaths.UPLOAD_DIR;


@RestController
public class flashcardController {

    @Autowired
    private openRouterservice openRouterservice;



    @PostMapping("/save-flashcards")
    public ResponseEntity<String> saveFlashcards(
            @RequestParam(value = "filename", required = false) String filename,
            @RequestBody String flashcardsJson) {

        try {
            Path dirPath = Paths.get("flashcards");
            Files.createDirectories(dirPath);


            if (filename == null || filename.trim().isEmpty()) {
                filename = "flashcards_" + System.currentTimeMillis();
            }
            filename = filename.endsWith(".json") ? filename : filename + ".json";

            Path filePath = dirPath.resolve(filename);
            Files.write(filePath, flashcardsJson.getBytes());

            return ResponseEntity.ok("Flashcards saved as " + filename);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to save flashcards");
        }
    }


    @GetMapping("/list-flashcards")
    public ResponseEntity<List<String>> listFlashcards() {
        try {
            File folder = new File("flashcards");
            if (!folder.exists() || !folder.isDirectory()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(List.of("Flashcards folder not found"));
            }

            String[] files = folder.list((dir, name) -> name.endsWith(".json"));

            if (files == null || files.length == 0) {
                return ResponseEntity.ok(List.of()); // Return empty list if no files
            }

            return ResponseEntity.ok(List.of(files));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(List.of("Failed to list flashcard files"));
        }
    }

    @GetMapping("/flashcards/view")
    public ResponseEntity<?> viewSavedFlashcards(@RequestParam("filename") String filename) {
        Path path = Paths.get("flashcards/" + filename);

        if (!Files.exists(path)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("File not found: " + filename);
        }

        try {
            String content = Files.readString(path);
            return ResponseEntity.ok(content);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to read file: " + filename);
        }
    }


    @DeleteMapping("/flashcards/delete")
    public ResponseEntity<String> deleteFlashcard(@RequestParam("filename") String filename) {
        Path path = Paths.get("flashcards/" + filename);

        if (!Files.exists(path)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("File not found: " + filename);
        }

        try {
            Files.delete(path);
            return ResponseEntity.ok("Deleted flashcard file: " + filename);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete file: " + filename);
        }
    }
}
