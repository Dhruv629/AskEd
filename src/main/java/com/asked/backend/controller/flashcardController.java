package com.asked.backend.controller;

import com.asked.backend.model.flashcard;
import com.asked.backend.model.flashcardRepository;
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

    @Autowired
    private flashcardRepository flashcardRepository;

    // ===================== FILE-BASED ENDPOINTS =====================

    /**
     * Save flashcards to file (legacy)
     */
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


    /**
     * List flashcard files (legacy)
     */
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

    /**
     * View saved flashcards from file (legacy)
     */
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


    /**
     * Delete flashcard file (legacy)
     */
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

    // ===================== DATABASE-BACKED ENDPOINTS =====================

    /**
     * Save a list of flashcards to the database
     */
    @PostMapping("/db/flashcards")
    public ResponseEntity<List<flashcard>> saveFlashcardsToDb(@RequestBody List<flashcard> flashcards) {
        List<flashcard> saved = flashcardRepository.saveAll(flashcards);
        return ResponseEntity.ok(saved);
    }

    /**
     * Get all flashcards from the database
     */
    @GetMapping("/db/flashcards")
    public ResponseEntity<List<flashcard>> getAllFlashcardsFromDb() {
        return ResponseEntity.ok(flashcardRepository.findAll());
    }

    /**
     * Get a single flashcard by ID from the database
     */
    @GetMapping("/db/flashcards/{id}")
    public ResponseEntity<?> getFlashcardById(@PathVariable Long id) {
        return flashcardRepository.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body("Flashcard not found"));
    }

    /**
     * Delete a flashcard by ID from the database
     */
    @DeleteMapping("/db/flashcards/{id}")
    public ResponseEntity<String> deleteFlashcardById(@PathVariable Long id) {
        if (!flashcardRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Flashcard not found");
        }
        flashcardRepository.deleteById(id);
        return ResponseEntity.ok("Flashcard deleted");
    }
}
