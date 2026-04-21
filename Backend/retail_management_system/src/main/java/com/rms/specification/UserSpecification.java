package com.rms.specification;

import com.rms.model.User;
import com.rms.model.enums.Role;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public class UserSpecification {

    public static Specification<User> byRole(String role) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(role)) return cb.conjunction();
            try {
                Role roleEnum = Role.valueOf(role);
                return cb.equal(root.get("role"), roleEnum);
            } catch (IllegalArgumentException e) {
                return cb.disjunction();
            }
        };
    }

    public static Specification<User> byActive(Boolean isActive) {
        return (root, query, cb) -> {
            if (isActive == null) return cb.conjunction();
            return cb.equal(root.get("isActive"), isActive);
        };
    }

    public static Specification<User> byUsernameContaining(String username) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(username)) return cb.conjunction();
            return cb.like(cb.lower(root.get("username")), "%" + username.toLowerCase() + "%");
        };
    }

    public static Specification<User> byEmailContaining(String email) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(email)) return cb.conjunction();
            return cb.like(cb.lower(root.get("email")), "%" + email.toLowerCase() + "%");
        };
    }

    public static Specification<User> byRoleAndActive(String role, Boolean isActive) {
        return Specification.where(byRole(role))
                .and(byActive(isActive != null ? isActive : true));
    }



    public static Specification<User> withFilters(String role, Boolean isActive, String search) {
        Specification<User> spec = Specification.where(byRole(role))
                .and(byActive(isActive));

        if (StringUtils.hasText(search)) {
            spec = spec.and(byUsernameContaining(search)
                    .or(byEmailContaining(search)));
        }

        return spec;
    }
}