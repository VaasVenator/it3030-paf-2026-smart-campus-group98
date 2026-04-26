package com.vaas.paf;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class PafApplication {

	public static void main(String[] args) {
		SpringApplication.run(PafApplication.class, args);
	}

	@Bean
	CommandLineRunner cleanupIndexes(org.springframework.data.mongodb.core.MongoTemplate mongoTemplate) {
		return args -> {
			try {
				mongoTemplate.indexOps("users").dropIndex("studentId");
			} catch (Exception e) {
				// Ignore if doesn't exist
			}
			// Manually create the sparse unique index
			try {
				mongoTemplate.indexOps("users").ensureIndex(
					new org.springframework.data.mongodb.core.index.Index()
						.on("studentId", org.springframework.data.domain.Sort.Direction.ASC)
						.unique()
						.sparse()
				);
			} catch (Exception e) {
				System.err.println("Failed to create index: " + e.getMessage());
			}
		};
	}
}
