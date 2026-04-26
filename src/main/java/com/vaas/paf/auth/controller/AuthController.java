/**
 * Implementation by Member 4: Notifications + role management + OAuth integration improvements.
 */
package com.vaas.paf.auth.controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.vaas.paf.auth.dto.AuthUserResponse;
import com.vaas.paf.auth.dto.LoginRequest;
import com.vaas.paf.auth.dto.SignupRequest;
import com.vaas.paf.auth.dto.UpdateProfileRequest;
import com.vaas.paf.auth.service.AuthService;

import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private final AuthService authService;

	public AuthController(AuthService authService) {
		this.authService = authService;
	}

	@PostMapping("/signup")
	@ResponseStatus(HttpStatus.CREATED)
	public AuthUserResponse signup(@Valid @RequestBody SignupRequest request) {
		return authService.signup(request);
	}

	@PostMapping("/login")
	public AuthUserResponse login(@Valid @RequestBody LoginRequest request) {
		return authService.login(request);
	}

	@GetMapping("/oauth2/session")
	public AuthUserResponse oauth2Session(Authentication authentication) {
		return authService.oauthSessionUser(authentication);
	}

	@GetMapping("/me")
	public AuthUserResponse me() {
		return authService.currentUserProfile();
	}

	@PutMapping("/me")
	public AuthUserResponse updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
		return authService.updateCurrentUser(request);
	}

	@DeleteMapping("/me")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deleteProfile() {
		authService.deleteCurrentUser();
	}

	@PostMapping("/logout")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void logout(HttpServletRequest request) {
		var session = request.getSession(false);
		if (session != null) {
			session.invalidate();
		}
		SecurityContextHolder.clearContext();
	}
}
