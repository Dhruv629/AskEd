package com.asked.backend.service;

import org.springframework.stereotype.Service;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Map;

@Service
public class RateLimitService {
    
    // Store rate limit data: IP -> (count, resetTime)
    private final Map<String, RateLimitData> rateLimitMap = new ConcurrentHashMap<>();
    
    // Rate limit configuration
    private static final int MAX_REQUESTS_PER_MINUTE = 60;
    private static final int MAX_REQUESTS_PER_HOUR = 1000;
    private static final int MAX_AI_REQUESTS_PER_MINUTE = 10;
    private static final int MAX_AI_REQUESTS_PER_HOUR = 100;
    
    public boolean isAllowed(String clientId, String endpoint) {
        String key = clientId + ":" + endpoint;
        LocalDateTime now = LocalDateTime.now();
        
        RateLimitData data = rateLimitMap.get(key);
        
        if (data == null) {
            // First request from this client
            data = new RateLimitData(now);
            rateLimitMap.put(key, data);
            return true;
        }
        
        // Check if we need to reset the counter
        if (ChronoUnit.MINUTES.between(data.getResetTime(), now) >= 1) {
            data.reset(now);
        }
        
        // Determine limits based on endpoint
        int maxRequests = getMaxRequestsForEndpoint(endpoint);
        
        if (data.getCount() >= maxRequests) {
            return false;
        }
        
        data.increment();
        return true;
    }
    
    private int getMaxRequestsForEndpoint(String endpoint) {
        if (endpoint.startsWith("/ai/")) {
            return MAX_AI_REQUESTS_PER_MINUTE;
        }
        return MAX_REQUESTS_PER_MINUTE;
    }
    
    public void cleanup() {
        LocalDateTime now = LocalDateTime.now();
        rateLimitMap.entrySet().removeIf(entry -> 
            ChronoUnit.HOURS.between(entry.getValue().getResetTime(), now) >= 1
        );
    }
    
    private static class RateLimitData {
        private AtomicInteger count;
        private LocalDateTime resetTime;
        
        public RateLimitData(LocalDateTime resetTime) {
            this.count = new AtomicInteger(1);
            this.resetTime = resetTime;
        }
        
        public void increment() {
            count.incrementAndGet();
        }
        
        public int getCount() {
            return count.get();
        }
        
        public LocalDateTime getResetTime() {
            return resetTime;
        }
        
        public void reset(LocalDateTime newResetTime) {
            this.count.set(0);
            this.resetTime = newResetTime;
        }
    }
} 