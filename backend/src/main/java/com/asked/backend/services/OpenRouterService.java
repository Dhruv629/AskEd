package com.asked.backend.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
public class OpenRouterService {

    @Value("${openrouter.api.key}")
    private String apiKey;

    private static final String API_URL = "https://openrouter.ai/api/v1/chat/completions";

    public  String getFlashcardsFromText(String inputText) throws IOException {
        OkHttpClient client = new OkHttpClient();
        ObjectMapper mapper = new ObjectMapper();

        String prompt = "Generate at least 12 educational flashcards from this content. " +
                "Each flashcard should be in JSON format with 'question' and 'answer' fields only.\n\n" + inputText;

        Map<String, Object> message = new HashMap<>();
        message.put("role", "user");
        message.put("content", prompt);

        Map<String, Object> body = new HashMap<>();
        body.put("model", "qwen/qwen3-8b-04-28");
        body.put("messages", new Object[]{message});
        body.put("temperature", 0.7);

        RequestBody requestBody = RequestBody.create(
                mapper.writeValueAsString(body),
                MediaType.parse("application/json")
        );

        Request request = new Request.Builder()
                .url(API_URL)
                .header("Authorization", "Bearer " + apiKey)
                .header("HTTP-Referer", "https://your-app-name.com")
                .header("X-Title", "AskEd")
                .post(requestBody)
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (response.isSuccessful()) {
                Map<String, Object> resBody = mapper.readValue(response.body().string(), Map.class);
                String content = (String) ((Map)((Map)((java.util.List) resBody.get("choices")).get(0)).get("message")).get("content");
                return content;
            } else {
                throw new IOException("OpenRouter Error: " + response.body().string());
            }
        }
    }

    public String summarizeText(String inputText, String customPrompt) throws IOException {
        OkHttpClient client = new OkHttpClient();
        ObjectMapper mapper = new ObjectMapper();

        // 🔹 Combine prompt with input
        String content;
        if (customPrompt != null && !customPrompt.trim().isEmpty()) {
            content = customPrompt.trim() + "\n\n" + inputText;
        } else {
            content = inputText;
        }

        // 🔹 Prepare OpenRouter message payload
        Map<String, Object> message = new HashMap<>();
        message.put("role", "user");
        message.put("content", content);

        Map<String, Object> body = new HashMap<>();
        body.put("model", "qwen/qwen3-8b-04-28");
        body.put("messages", new Object[]{message});
        body.put("temperature", 0.7);

        RequestBody requestBody = RequestBody.create(
                mapper.writeValueAsString(body),
                MediaType.parse("application/json")
        );

        Request request = new Request.Builder()
                .url("https://openrouter.ai/api/v1/chat/completions")
                .header("Authorization", "Bearer " + apiKey)
                .header("HTTP-Referer", "https://asked.local")
                .header("X-Title", "AskEd")
                .post(requestBody)
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (response.isSuccessful()) {
                Map<String, Object> resBody = mapper.readValue(response.body().string(), Map.class);
                return (String) ((Map)((Map)((java.util.List) resBody.get("choices")).get(0)).get("message")).get("content");
            } else {
                throw new IOException("OpenRouter Error: " + response.body().string());
            }
        }
    }


    public String generateQuizFromText(String inputText) throws IOException {
        OkHttpClient client = new OkHttpClient();
        ObjectMapper mapper = new ObjectMapper();

        String prompt = "Generate 5 multiple choice quiz questions from the following text. " +
                "Each question should be in JSON format with fields: 'question', 'options' (as a list), and 'answer'. " +
                "Return the result as a JSON array only.\n\n" + inputText;

        Map<String, Object> message = new HashMap<>();
        message.put("role", "user");
        message.put("content", prompt);

        Map<String, Object> body = new HashMap<>();
        body.put("model", "qwen/qwen3-8b-04-28");
        body.put("messages", new Object[]{message});
        body.put("temperature", 0.7);

        RequestBody requestBody = RequestBody.create(
                mapper.writeValueAsString(body),
                MediaType.parse("application/json")
        );

        Request request = new Request.Builder()
                .url("https://openrouter.ai/api/v1/chat/completions")
                .header("Authorization", "Bearer " + apiKey)
                .header("HTTP-Referer", "https://asked.local")
                .header("X-Title", "AskEd")
                .post(requestBody)
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (response.isSuccessful()) {
                Map<String, Object> resBody = mapper.readValue(response.body().string(), Map.class);
                return (String) ((Map)((Map)((java.util.List) resBody.get("choices")).get(0)).get("message")).get("content");
            } else {
                throw new IOException("OpenRouter Error: " + response.body().string());
            }
        }
    }


}
