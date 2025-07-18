package com.asked.backend.model;

import jakarta.persistence.*;

@Entity
public class flashcard {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String question;
    private String answer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private String folder;

    public flashcard() {}

    public flashcard(String question, String answer) {
        this.question = question;
        this.answer = answer;
    }

    public flashcard(String question, String answer, User user) {
        this.question = question;
        this.answer = answer;
        this.user = user;
    }

    public flashcard(String question, String answer, User user, String folder) {
        this.question = question;
        this.answer = answer;
        this.user = user;
        this.folder = folder;
    }

    public Long getId() {
        return id;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public String getAnswer() {
        return answer;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getFolder() {
        return folder;
    }

    public void setFolder(String folder) {
        this.folder = folder;
    }
}
