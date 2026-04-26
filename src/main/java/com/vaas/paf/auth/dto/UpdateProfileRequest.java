package com.vaas.paf.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
		String username,
		@NotBlank(message = "First name is required.") String firstName,
		@NotBlank(message = "Last name is required.") String lastName,
		String newPassword,
		String confirmNewPassword,
		String profilePictureUrl) {
}
