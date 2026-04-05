package com.vaas.paf.auth.repo;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.vaas.paf.auth.model.UserDocument;

public interface UserRepository extends MongoRepository<UserDocument, String> {

	Optional<UserDocument> findByStudentId(String studentId);

	boolean existsByStudentId(String studentId);

	boolean existsByUsernameIgnoreCase(String username);
}
