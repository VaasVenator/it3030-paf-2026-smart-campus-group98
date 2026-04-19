package com.vaas.paf.auth.service;

import java.time.Instant;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.vaas.paf.auth.dto.AuthUserResponse;
import com.vaas.paf.auth.dto.LoginRequest;
import com.vaas.paf.auth.dto.SignupRequest;
import com.vaas.paf.auth.dto.UpdateProfileRequest;
import com.vaas.paf.auth.model.AuthProvider;
import com.vaas.paf.auth.model.UserDocument;
import com.vaas.paf.auth.repo.UserRepository;
import com.vaas.paf.common.AppException;
import com.vaas.paf.security.AccessGuard;
import com.vaas.paf.security.UserRole;

@Service
public class AuthService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final AccessGuard accessGuard;

	public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, AccessGuard accessGuard) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.accessGuard = accessGuard;
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
				.email(null)
				.googleSubject(null)
				.authProvider(AuthProvider.LOCAL)
				.firstName(request.firstName().trim())
				.lastName(request.lastName().trim())
				.passwordHash(passwordEncoder.encode(request.password()))
				.role(UserRole.USER)
				.createdAt(Instant.now())
				.build();

		@SuppressWarnings("null")
		AuthUserResponse result = toResponse(userRepository.save(user));
		return result;
	}

	public AuthUserResponse login(LoginRequest request) {
		UserDocument user = userRepository.findByStudentId(request.studentId().trim().toUpperCase())
				.orElseThrow(() -> new AppException(HttpStatus.UNAUTHORIZED, "Invalid student ID or password."));

		if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
			throw new AppException(HttpStatus.UNAUTHORIZED, "Invalid student ID or password.");
		}

		return toResponse(user);
	}

	public AuthUserResponse oauthSessionUser(Authentication authentication) {
		if (authentication == null || !(authentication.getPrincipal() instanceof OAuth2User oauthUser)) {
			throw new AppException(HttpStatus.UNAUTHORIZED, "Google sign-in session was not found.");
		}

		return toResponse(findOrCreateGoogleUser(oauthUser));
	}

	public AuthUserResponse currentUserProfile() {
		return toResponse(getCurrentUserDocument());
	}

	public AuthUserResponse updateCurrentUser(UpdateProfileRequest request) {
		UserDocument user = getCurrentUserDocument();
		String requestedUsername = request.username().trim();

		if (!user.getUsername().equalsIgnoreCase(requestedUsername)
				&& userRepository.existsByUsernameIgnoreCase(requestedUsername)) {
			throw new AppException(HttpStatus.CONFLICT, "That username is already taken.");
		}

		user.setUsername(requestedUsername);
		user.setFirstName(request.firstName().trim());
		user.setLastName(request.lastName().trim());

		String newPassword = request.newPassword() == null ? "" : request.newPassword().trim();
		String confirmNewPassword = request.confirmNewPassword() == null ? "" : request.confirmNewPassword().trim();
		if (!newPassword.isBlank() || !confirmNewPassword.isBlank()) {
			if (!newPassword.equals(confirmNewPassword)) {
				throw new AppException(HttpStatus.BAD_REQUEST, "New password and confirm password must match.");
			}
			user.setPasswordHash(passwordEncoder.encode(newPassword));
		}

		return toResponse(userRepository.save(user));
	}

	@SuppressWarnings("null")
	public void deleteCurrentUser() {
		@SuppressWarnings("null")
		UserDocument user = getCurrentUserDocument();
		{
			@SuppressWarnings("null")
			UserDocument toDelete = user;
			userRepository.delete(toDelete);
		}
	}

	private UserDocument getCurrentUserDocument() {
		String userId = accessGuard.currentUser().userId();
			@SuppressWarnings("null")
			UserDocument user = userRepository.findById(userId)
					.orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "User profile not found."));
			return user;
	}

	private AuthUserResponse toResponse(UserDocument user) {
		String displayName = "%s %s".formatted(user.getFirstName(), user.getLastName()).trim();
		return new AuthUserResponse(
				user.getId(),
				user.getStudentId(),
				user.getUsername(),
				user.getEmail(),
				user.getFirstName(),
				user.getLastName(),
				displayName,
				user.getRole(),
				user.getAuthProvider());
	}

	private UserDocument findOrCreateGoogleUser(OAuth2User oauthUser) {
		String googleSubject = requiredString(oauthUser.getAttributes(), "sub", "Google account identifier is missing.");
		String email = requiredString(oauthUser.getAttributes(), "email", "Google account email is missing.")
				.toLowerCase(Locale.ROOT);

		Optional<UserDocument> existingGoogleUser = userRepository.findByGoogleSubject(googleSubject);
		if (existingGoogleUser.isPresent()) {
				@SuppressWarnings("null")
				UserDocument updated = updateGoogleProfile(existingGoogleUser.get(), oauthUser, email, googleSubject);
				return updated;
		}

		Optional<UserDocument> existingEmailUser = userRepository.findByEmailIgnoreCase(email);
		if (existingEmailUser.isPresent()) {
			return linkGoogleToExistingUser(existingEmailUser.get(), oauthUser, email, googleSubject);
		}

		UserDocument user = UserDocument.builder()
				.studentId(null)
				.username(generateUniqueUsername(oauthUser, email))
				.email(email)
				.googleSubject(googleSubject)
				.authProvider(AuthProvider.GOOGLE)
				.firstName(resolveFirstName(oauthUser))
				.lastName(resolveLastName(oauthUser))
				.passwordHash(null)
				.role(UserRole.USER)
				.createdAt(Instant.now())
				.build();

		@SuppressWarnings("null")
		UserDocument saved = userRepository.save(user);
		return saved;
	}

	private UserDocument updateGoogleProfile(UserDocument user, OAuth2User oauthUser, String email, String googleSubject) {
		user.setEmail(email);
		user.setGoogleSubject(googleSubject);
		user.setAuthProvider(AuthProvider.GOOGLE);
		user.setFirstName(resolveFirstName(oauthUser));
		user.setLastName(resolveLastName(oauthUser));
		@SuppressWarnings("null")
		UserDocument updated = userRepository.save(user);
		return updated;
	}

	private UserDocument linkGoogleToExistingUser(UserDocument user, OAuth2User oauthUser, String email, String googleSubject) {
		user.setEmail(email);
		user.setGoogleSubject(googleSubject);
		user.setAuthProvider(AuthProvider.GOOGLE);
		if (user.getFirstName() == null || user.getFirstName().isBlank()) {
			user.setFirstName(resolveFirstName(oauthUser));
		}
		if (user.getLastName() == null || user.getLastName().isBlank()) {
			user.setLastName(resolveLastName(oauthUser));
		}
		return userRepository.save(user);
	}

	private String generateUniqueUsername(OAuth2User oauthUser, String email) {
		String base = sanitizeUsername(resolvePreferredUsername(oauthUser, email));
		String candidate = base;
		int suffix = 1;

		while (userRepository.existsByUsernameIgnoreCase(candidate)) {
			candidate = "%s%d".formatted(base, suffix++);
		}

		return candidate;
	}

	private String resolvePreferredUsername(OAuth2User oauthUser, String email) {
		String preferred = firstNonBlank(
				stringAttribute(oauthUser, "preferred_username"),
				stringAttribute(oauthUser, "given_name"),
				email.substring(0, email.indexOf('@')));
		return preferred == null ? "campususer" : preferred;
	}

	private String resolveFirstName(OAuth2User oauthUser) {
		String givenName = firstNonBlank(
				stringAttribute(oauthUser, "given_name"),
				stringAttribute(oauthUser, "name"));
		return givenName == null ? "Campus" : givenName;
	}

	private String resolveLastName(OAuth2User oauthUser) {
		String familyName = firstNonBlank(stringAttribute(oauthUser, "family_name"));
		return familyName == null ? "User" : familyName;
	}

	private String sanitizeUsername(String value) {
		String sanitized = value.trim().toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9._-]", "");
		return sanitized.isBlank() ? "campususer" : sanitized;
	}

	private String requiredString(Map<String, Object> attributes, String key, String message) {
		Object value = attributes.get(key);
		if (value instanceof String text && !text.isBlank()) {
			return text.trim();
		}
		throw new AppException(HttpStatus.BAD_REQUEST, message);
	}

	private String firstNonBlank(String... values) {
		for (String value : values) {
			if (value != null && !value.isBlank()) {
				return value.trim();
			}
		}
		return null;
	}

	private String stringAttribute(OAuth2User oauthUser, String key) {
		Object value = oauthUser.getAttributes().get(key);
		if (value instanceof String text) {
			return text;
		}
		return null;
	}
}
