package com.asked.backend.controller;


import com.asked.backend.dto.QuizRequest;
import com.asked.backend.services.OpenRouterService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static com.asked.backend.utils.fileStoragePaths.*;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
public class quizController {

    @Autowired
    private OpenRouterService openRouterservice;


    @PostMapping("/save-quiz")
    public ResponseEntity<String> saveQuiz(@RequestBody Map<String, Object> payload) {
        try {
            // Extract name and quiz data
            String name = (String) payload.get("name");
            Object data = payload.get("data");

            if (name == null || name.trim().isEmpty()) {
                name = "quiz_" + System.currentTimeMillis();
            }

            Path path = Paths.get("quizzes/" + name + ".json");
            Files.createDirectories(path.getParent());


            ObjectMapper mapper = new ObjectMapper();
            String quizJson = mapper.writeValueAsString(data);

            Files.write(path, quizJson.getBytes());
            return ResponseEntity.ok("Quiz saved as " + name + ".json");
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to save quiz");
        }
    }

    @GetMapping("/list-quizzes")
    public ResponseEntity<List<String>> listQuizzes() {
        File folder = new File("quizzes/");
        if (!folder.exists()) {
            return ResponseEntity.ok(new ArrayList<>());
        }

        File[] files = folder.listFiles((dir, name) -> name.endsWith(".json"));
        List<String> filenames = new ArrayList<>();
        if (files != null) {
            for (File file : files) {
                filenames.add(file.getName());
            }
        }

        return ResponseEntity.ok(filenames);
    }

    @DeleteMapping("/quizzes/{filename}")
    public ResponseEntity<String> deleteQuiz(@PathVariable String filename) {
        File file = new File("quizzes/" + filename);
        if (file.exists()) {
            if (file.delete()) {
                return ResponseEntity.ok("Quiz deleted: " + filename);
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Failed to delete quiz: " + filename);
            }
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Quiz not found: " + filename);
        }
    }
}
