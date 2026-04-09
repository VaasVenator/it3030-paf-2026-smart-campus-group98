package com.vaas.paf.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
		@NotBlank(message = "Username is required.") String username,
		@NotBlank(message = "First name is required.") String firstName,
		@NotBlank(message = "Last name is required.") String lastName,
		@Size(min = 8, message = "Password must be at least 8 characters.") String newPassword,
		String confirmNewPassword) {
}
