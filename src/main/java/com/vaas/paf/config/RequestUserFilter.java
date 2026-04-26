package com.vaas.paf.config;

import java.io.IOException;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.vaas.paf.security.AuthenticatedUser;
import com.vaas.paf.security.RequestUserContext;
import com.vaas.paf.security.UserRole;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class RequestUserFilter extends OncePerRequestFilter {

	@Override
	protected void doFilterInternal(
			@NonNull HttpServletRequest request,
			@NonNull HttpServletResponse response,
			@NonNull FilterChain filterChain) throws ServletException, IOException {
		String userId = request.getHeader("X-User-Id");
		String userName = request.getHeader("X-User-Name");
		String roleValue = request.getHeader("X-User-Role");

		if (userId != null && !userId.isBlank() && userName != null && !userName.isBlank() && roleValue != null && !roleValue.isBlank()) {
			try {
				UserRole role = UserRole.valueOf(roleValue.toUpperCase());
				RequestUserContext.setCurrentUser(new AuthenticatedUser(userId, userName, role));
			} catch (IllegalArgumentException exception) {
				// Invalid role value in header, fall through to use default user
			}
		}

		try {
			filterChain.doFilter(request, response);
		} finally {
			RequestUserContext.clear();
		}
	}
}
