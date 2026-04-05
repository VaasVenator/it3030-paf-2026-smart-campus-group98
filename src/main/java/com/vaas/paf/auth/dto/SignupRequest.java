package com.vaas.paf.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record SignupRequest(
		@NotBlank(message = "Student ID is required.")
		@Pattern(regexp = "^IT\\d{8}$", message = "Student ID must match the format IT12345678.")
		String studentId,
		@NotBlank(message = "Username is required.") String username,
		@NotBlank(message = "First name is required.") String firstName,
		@NotBlank(message = "Last name is required.") String lastName,
		@NotBlank(message = "Password is required.")
		@Size(min = 8, message = "Password must be at least 8 characters.")
		String password,
		@NotBlank(message = "Confirm password is required.") String confirmPassword) {
}
