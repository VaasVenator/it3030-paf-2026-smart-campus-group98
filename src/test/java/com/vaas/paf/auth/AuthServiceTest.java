package com.vaas.paf.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.vaas.paf.auth.dto.LoginRequest;
import com.vaas.paf.auth.dto.SignupRequest;
import com.vaas.paf.auth.model.UserDocument;
import com.vaas.paf.auth.repo.UserRepository;
import com.vaas.paf.auth.service.AuthService;
import com.vaas.paf.common.AppException;
import com.vaas.paf.security.AccessGuard;
import com.vaas.paf.security.AuthenticatedUser;
import com.vaas.paf.security.UserRole;

class AuthServiceTest {

	@Mock
	private UserRepository userRepository;

	@Mock
	private PasswordEncoder passwordEncoder;

	@Mock
	private AccessGuard accessGuard;

	private AuthService authService;

	@BeforeEach
	void setUp() {
		MockitoAnnotations.openMocks(this);
		authService = new AuthService(userRepository, passwordEncoder, accessGuard);
	}

	@Test
	void signupShouldRejectMismatchedPasswords() {
		SignupRequest request = new SignupRequest("IT12345678", "sahan", "Sahan", "Vaas", "password1", "password2", null);
		AppException exception = assertThrows(AppException.class, () -> authService.signup(request));
		assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
	}

	@Test
	void loginShouldRejectInvalidPassword() {
		UserDocument user = UserDocument.builder()
				.id("user-1")
				.studentId("IT12345678")
				.username("sahan")
				.firstName("Sahan")
				.lastName("Vaas")
				.passwordHash("hashed")
				.role(UserRole.USER)
				.build();

		when(userRepository.findByStudentId("IT12345678")).thenReturn(Optional.of(user));
		when(passwordEncoder.matches("wrongpass", "hashed")).thenReturn(false);

		AppException exception = assertThrows(
				AppException.class,
				() -> authService.login(new LoginRequest("IT12345678", "wrongpass")));
		assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatus());
	}

	@Test
	void signupShouldCreateUserWhenValid() {
		SignupRequest request = new SignupRequest("IT12345678", "sahan", "Sahan", "Vaas", "password1", "password1", null);
		when(userRepository.existsByStudentId("IT12345678")).thenReturn(false);
		when(userRepository.existsByUsernameIgnoreCase("sahan")).thenReturn(false);
		when(passwordEncoder.encode("password1")).thenReturn("hashed");
		@SuppressWarnings({"null", "unused"})
		var saveAnswer = when(userRepository.save(any(UserDocument.class))).thenAnswer(invocation -> {
			UserDocument user = invocation.getArgument(0);
			user.setId("user-1");
			return user;
		});

		var response = authService.signup(request);
		assertEquals("user-1", response.userId());
		assertEquals("IT12345678", response.studentId());
	}

	@Test
	void updateProfileShouldRejectMismatchedNewPasswords() {
		UserDocument user = UserDocument.builder()
				.id("user-1")
				.studentId("IT12345678")
				.username("sahan")
				.firstName("Sahan")
				.lastName("Vaas")
				.passwordHash("hashed")
				.role(UserRole.USER)
				.build();

		when(accessGuard.currentUser()).thenReturn(new AuthenticatedUser("user-1", "Sahan Vaas", UserRole.USER));
		when(userRepository.findById("user-1")).thenReturn(Optional.of(user));

		AppException exception = assertThrows(
				AppException.class,
				() -> authService.updateCurrentUser(new com.vaas.paf.auth.dto.UpdateProfileRequest(
						"sahan",
						"Sahan",
						"Vaas",
						null,
						"password1",
						"password2")));
		assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
	}
}
