package com.vaas.paf.auth.model;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.vaas.paf.security.UserRole;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class UserDocument {

	@Id
	private String id;

	@Indexed(unique = true)
	private String studentId;

	@Indexed(unique = true)
	private String username;

	private String firstName;
	private String lastName;
	private String passwordHash;
	private UserRole role;
	private Instant createdAt;
}
