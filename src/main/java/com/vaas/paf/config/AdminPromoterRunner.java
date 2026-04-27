package com.vaas.paf.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import com.vaas.paf.auth.repo.UserRepository;
import com.vaas.paf.security.UserRole;

@Component
public class AdminPromoterRunner implements ApplicationRunner {

	private final UserRepository userRepository;

	public AdminPromoterRunner(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	@Override
	@SuppressWarnings("null")
	public void run(ApplicationArguments args) {
		if (args.containsOption("list-users")) {
			System.out.println("--- CAMPUS HUB USER LIST ---");
			userRepository.findAll().forEach(user -> {
				System.out.println(String.format("ID: %s | Username: %s | Role: %s", 
						user.getId(), user.getUsername(), user.getRole()));
			});
			System.out.println("----------------------------");
		}

		if (args.containsOption("promote-admin")) {
			var identifierValues = args.getOptionValues("promote-admin");
			if (identifierValues == null || identifierValues.isEmpty()) {
				System.err.println("ADMIN_PROMOTER ERROR: No identifier provided.");
				return;
			}
			String identifier = identifierValues.get(0);
			
			// Try finding by ID, then Username, then Student ID
			userRepository.findById(identifier)
				.or(() -> userRepository.findByUsernameIgnoreCase(identifier))
				.or(() -> userRepository.findByStudentId(identifier))
				.ifPresentOrElse(user -> {
					user.setRole(UserRole.ADMIN);
					userRepository.save(user);
					System.out.println("ADMIN_PROMOTER: User '" + user.getUsername() + "' (" + user.getId() + ") has been promoted to ADMIN.");
				}, () -> {
					System.err.println("ADMIN_PROMOTER ERROR: User with identifier '" + identifier + "' not found.");
				});
		}
	}
}
