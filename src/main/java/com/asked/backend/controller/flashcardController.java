package com.asked.backend.controller;

import com.asked.backend.model.flashcard;
import com.asked.backend.model.flashcardRepository;
import com.asked.backend.model.User;
import com.asked.backend.model.UserRepository;
import com.asked.backend.services.openRouterservice;
import com.asked.backend.utils.JwtUtil;
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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;


@RestController
public class flashcardController {

    @Autowired
    private openRouterservice openRouterservice;

    @Autowired
    private flashcardRepository flashcardRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

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
     * Save a list of flashcards to the database (associated with authenticated user)
     */
    @PostMapping("/db/flashcards")
    public ResponseEntity<?> saveFlashcardsToDb(@RequestBody List<flashcard> flashcards) {
        try {
            // Get current authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Associate flashcards with the user
            for (flashcard card : flashcards) {
                card.setUser(user);
            }

            List<flashcard> saved = flashcardRepository.saveAll(flashcards);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to save flashcards: " + e.getMessage());
        }
    }

    /**
     * Get all flashcards for the authenticated user from the database
     */
    @GetMapping("/db/flashcards")
    public ResponseEntity<?> getAllFlashcardsFromDb() {
        try {
            // Get current authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Get flashcards for the specific user
            List<flashcard> userFlashcards = flashcardRepository.findByUser(user);
            return ResponseEntity.ok(userFlashcards);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve flashcards: " + e.getMessage());
        }
    }

    /**
     * Get a single flashcard by ID from the database (if owned by authenticated user)
     */
    @GetMapping("/db/flashcards/{id}")
    public ResponseEntity<?> getFlashcardById(@PathVariable Long id) {
        try {
            // Get current authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Find flashcard and check ownership
            return flashcardRepository.findById(id)
                    .map(card -> {
                        if (card.getUser().getId().equals(user.getId())) {
                            return ResponseEntity.ok(card);
                        } else {
                            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                    .body("Access denied");
                        }
                    })
                    .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body("Flashcard not found"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve flashcard: " + e.getMessage());
        }
    }

    /**
     * Delete a flashcard by ID from the database (if owned by authenticated user)
     */
    @DeleteMapping("/db/flashcards/{id}")
    public ResponseEntity<String> deleteFlashcardById(@PathVariable Long id) {
        try {
            // Get current authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Find flashcard and check ownership
            return flashcardRepository.findById(id)
                    .map(card -> {
                        if (card.getUser().getId().equals(user.getId())) {
                            flashcardRepository.deleteById(id);
                            return ResponseEntity.ok("Flashcard deleted");
                        } else {
                            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                    .body("Access denied");
                        }
                    })
                    .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body("Flashcard not found"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete flashcard: " + e.getMessage());
        }
    }
}
