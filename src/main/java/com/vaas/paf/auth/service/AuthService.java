package com.vaas.paf.auth.service;

import java.time.Instant;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.vaas.paf.auth.dto.AuthUserResponse;
import com.vaas.paf.auth.dto.LoginRequest;
import com.vaas.paf.auth.dto.SignupRequest;
import com.vaas.paf.auth.model.UserDocument;
import com.vaas.paf.auth.repo.UserRepository;
import com.vaas.paf.common.AppException;
import com.vaas.paf.security.UserRole;

@Service
public class AuthService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
	}

	public AuthUserResponse signup(SignupRequest request) {
		if (!request.password().equals(request.confirmPassword())) {
			throw new AppException(HttpStatus.BAD_REQUEST, "Password and confirm password must match.");
		}
		if (userRepository.existsByStudentId(request.studentId())) {
			throw new AppException(HttpStatus.CONFLICT, "A user with this student ID already exists.");
		}
		if (userRepository.existsByUsernameIgnoreCase(request.username())) {
			throw new AppException(HttpStatus.CONFLICT, "That username is already taken.");
		}

		UserDocument user = UserDocument.builder()
				.studentId(request.studentId().trim().toUpperCase())
				.username(request.username().trim())
				.firstName(request.firstName().trim())
				.lastName(request.lastName().trim())
				.passwordHash(passwordEncoder.encode(request.password()))
				.role(UserRole.USER)
				.createdAt(Instant.now())
				.build();

		return toResponse(userRepository.save(user));
	}

	public AuthUserResponse login(LoginRequest request) {
		UserDocument user = userRepository.findByStudentId(request.studentId().trim().toUpperCase())
				.orElseThrow(() -> new AppException(HttpStatus.UNAUTHORIZED, "Invalid student ID or password."));

		if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
			throw new AppException(HttpStatus.UNAUTHORIZED, "Invalid student ID or password.");
		}

		return toResponse(user);
	}

	private AuthUserResponse toResponse(UserDocument user) {
		String displayName = "%s %s".formatted(user.getFirstName(), user.getLastName()).trim();
		return new AuthUserResponse(
				user.getId(),
				user.getStudentId(),
				user.getUsername(),
				user.getFirstName(),
				user.getLastName(),
				displayName,
				user.getRole());
	}
}
