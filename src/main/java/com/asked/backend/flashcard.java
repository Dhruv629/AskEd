package com.asked.backend;

public class flashcard {
    private String question;
    private String answer;

    public flashcard(String question, String answer) {
        this.question = question;
        this.answer = answer;
    }

    public String getQuestion() {
        return question;
    }

    public String getAnswer() {
        return answer;
    }
}
