package com.vaas.paf.config;

import java.io.IOException;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableWebSecurity
public class SecurityConfiguration {

	@Bean
	SecurityFilterChain securityFilterChain(
			HttpSecurity http,
			RequestUserFilter requestUserFilter,
			ObjectProvider<ClientRegistrationRepository> clientRegistrationRepositoryProvider,
			@Value("${app.frontend.base-url:http://localhost:5173}") String frontendBaseUrl) throws Exception {
		http.cors(cors -> {
		})
				.csrf(csrf -> csrf.disable())
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
				.authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
				.addFilterBefore(requestUserFilter, UsernamePasswordAuthenticationFilter.class);

		if (clientRegistrationRepositoryProvider.getIfAvailable() != null) {
			http.oauth2Login(oauth -> oauth.successHandler((request, response, authentication) ->
					redirectToFrontend(request, response, frontendBaseUrl)));
		}

		return http.build();
	}

	private void redirectToFrontend(
			HttpServletRequest request,
			HttpServletResponse response,
			String frontendBaseUrl) throws IOException, ServletException {
		String target = frontendBaseUrl.endsWith("/")
				? frontendBaseUrl + "oauth-success"
				: frontendBaseUrl + "/oauth-success";
		response.sendRedirect(target);
	}

	@Bean
	PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
}
