package com.rms.utils;

import com.rms.constants.JwtProperties;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

import static com.rms.constants.Constants.*;

@Component
@RequiredArgsConstructor
public class JwtUtil {

//    private final String secret = "mysecretkeytocreatejwttokes123434567800";
//    private final long expiration = 1000 * 60 * 60; // 1 hour
    private final JwtProperties jwtProperties;

    private Key getSigninKey() {
        return Keys.hmacShaKeyFor(jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8));
    }

    // SIMPLE: Only store what's needed
    public String generateToken(String email, String role, Long userId) {
        return Jwts.builder()
                .setSubject(email)
                .claim(ROLE, role)
                .claim(USER_ID, userId)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtProperties.getExpiration()))
                .signWith(getSigninKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractEmail(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigninKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public String extractRole(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigninKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get(ROLE, String.class);
    }

    public Long extractUserId(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigninKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get(USER_ID, Long.class);
    }

    public boolean isTokenValid(String token) {
        try {
            Date expiration = Jwts.parserBuilder()
                    .setSigningKey(getSigninKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .getExpiration();
            return !expiration.before(new Date());
        } catch (Exception e) {
            return false;
        }
    }
}