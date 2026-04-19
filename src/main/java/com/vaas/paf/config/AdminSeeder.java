package com.vaas.paf.config;

import java.time.Instant;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.vaas.paf.auth.model.UserDocument;
import com.vaas.paf.auth.repo.UserRepository;
import com.vaas.paf.security.UserRole;

@Component
public class AdminSeeder implements ApplicationRunner {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final String adminStudentId;
	private final String adminUsername;
	private final String adminPassword;

	public AdminSeeder(
			UserRepository userRepository,
			PasswordEncoder passwordEncoder,
		@Value("${app.demo.admin.student-id:STF00000001}") String adminStudentId,
			@Value("${app.demo.admin.username:admin}") String adminUsername,
			@Value("${app.demo.admin.password:Admin@1234}") String adminPassword) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.adminStudentId = adminStudentId;
		this.adminUsername = adminUsername;
		this.adminPassword = adminPassword;
	}

	@Override
	public void run(ApplicationArguments args) {
		// Check if admin with new studentId already exists
		if (userRepository.existsByStudentId(adminStudentId)) {
			return;
		}

		// Check if old admin exists (with username "admin")
		java.util.Optional<UserDocument> existingAdmin = userRepository.findByUsernameIgnoreCase(adminUsername);
		if (existingAdmin.isPresent()) {
			// Update existing admin with new studentId
			UserDocument admin = existingAdmin.get();
			admin.setStudentId(adminStudentId);
			admin.setPasswordHash(passwordEncoder.encode(adminPassword));
			@SuppressWarnings({"null", "unused"})
			UserDocument saved = userRepository.save(admin);
			return;
		}

		// Create new admin if neither exists
		UserDocument admin = UserDocument.builder()
				.studentId(adminStudentId)
				.username(adminUsername)
				.firstName("System")
				.lastName("Admin")
				.passwordHash(passwordEncoder.encode(adminPassword))
				.role(UserRole.ADMIN)
				.createdAt(Instant.now())
				.build();

		@SuppressWarnings({"null", "unused"})
		UserDocument saved = userRepository.save(admin);
	}
}
