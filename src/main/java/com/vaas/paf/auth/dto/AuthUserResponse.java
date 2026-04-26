package com.vaas.paf.auth.dto;

import com.vaas.paf.auth.model.AuthProvider;
import com.vaas.paf.security.UserRole;

public record AuthUserResponse(
		String userId,
		String studentId,
		String username,
		String email,
		String firstName,
		String lastName,
		String displayName,
		UserRole role,
		AuthProvider authProvider,
		String profilePictureUrl) {
}
