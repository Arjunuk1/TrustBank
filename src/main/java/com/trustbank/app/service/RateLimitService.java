package com.trustbank.app.service;

import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
public class RateLimitService {
    
    private static final int MAX_ATTEMPTS = 5;
    private static final int LOCKOUT_DURATION_MINUTES = 15;
    
    private final Map<Integer, LoginAttempt> loginAttempts = new ConcurrentHashMap<>();
    
    public void recordLoginAttempt(int accountNumber, boolean success) {
        LoginAttempt attempt = loginAttempts.getOrDefault(accountNumber, new LoginAttempt());
        
        if (success) {
            loginAttempts.remove(accountNumber); // Clear on successful login
        } else {
            attempt.incrementAttempts();
            loginAttempts.put(accountNumber, attempt);
        }
    }
    
    public boolean isAccountLocked(int accountNumber) {
        LoginAttempt attempt = loginAttempts.get(accountNumber);
        if (attempt == null) return false;
        
        if (attempt.isExpired()) {
            loginAttempts.remove(accountNumber);
            return false;
        }
        
        return attempt.getAttemptCount() >= MAX_ATTEMPTS;
    }
    
    public int getRemainingAttempts(int accountNumber) {
        LoginAttempt attempt = loginAttempts.get(accountNumber);
        if (attempt == null) return MAX_ATTEMPTS;
        return Math.max(0, MAX_ATTEMPTS - attempt.getAttemptCount());
    }
    
    public LocalDateTime getUnlockTime(int accountNumber) {
        LoginAttempt attempt = loginAttempts.get(accountNumber);
        if (attempt == null) return null;
        return attempt.getFirstAttemptTime().plus(LOCKOUT_DURATION_MINUTES, ChronoUnit.MINUTES);
    }
    
    private static class LoginAttempt {
        private int attemptCount = 0;
        private LocalDateTime firstAttemptTime;
        
        public void incrementAttempts() {
            if (firstAttemptTime == null) {
                firstAttemptTime = LocalDateTime.now();
            }
            attemptCount++;
        }
        
        public boolean isExpired() {
            if (firstAttemptTime == null) return true;
            return ChronoUnit.MINUTES.between(firstAttemptTime, LocalDateTime.now()) >= LOCKOUT_DURATION_MINUTES;
        }
        
        public int getAttemptCount() { return attemptCount; }
        public LocalDateTime getFirstAttemptTime() { return firstAttemptTime; }
    }
}
