package com.asked.backend.model;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface flashcardRepository extends JpaRepository<flashcard, Long> {
    List<flashcard> findByUser(User user);
} 