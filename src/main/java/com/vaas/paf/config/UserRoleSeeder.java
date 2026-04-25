package com.vaas.paf.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import com.vaas.paf.auth.repo.UserRepository;
import com.vaas.paf.security.UserRole;

@Component
public class UserRoleSeeder implements ApplicationRunner {

	private final UserRepository userRepository;

	public UserRoleSeeder(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	@Override
	public void run(ApplicationArguments args) {
		userRepository.findByUsernameIgnoreCase("Tim").ifPresent(user -> {
			if (user.getRole() != UserRole.ADMIN) {
				user.setRole(UserRole.ADMIN);
				userRepository.save(user);
				System.out.println("USER_ROLE_SEEDER: Promoted 'Tim' to ADMIN role.");
			}
		});
	}
}
