package com.vaas.paf.config;

import java.time.LocalTime;
import java.util.List;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import com.vaas.paf.resource.model.ResourceDocument;
import com.vaas.paf.resource.model.ResourceStatus;
import com.vaas.paf.resource.model.ResourceType;
import com.vaas.paf.resource.repo.ResourceRepository;

@Component
public class DataSeeder implements ApplicationRunner {

	private final ResourceRepository resourceRepository;

	public DataSeeder(ResourceRepository resourceRepository) {
		this.resourceRepository = resourceRepository;
	}

	@Override
	public void run(ApplicationArguments args) {
		if (resourceRepository.count() > 0) {
			return;
		}

		@SuppressWarnings({"null", "unused"})
		var resources = resourceRepository.saveAll(List.of(
				ResourceDocument.builder()
						.name("Main Lecture Hall A")
						.type(ResourceType.LECTURE_HALL)
						.capacity(120)
						.location("Faculty Building A")
						.availabilityStart(LocalTime.of(8, 0))
						.availabilityEnd(LocalTime.of(18, 0))
						.status(ResourceStatus.ACTIVE)
						.amenities(List.of("Projector", "Air Conditioning", "PA System"))
						.build(),
				ResourceDocument.builder()
						.name("Networking Lab 02")
						.type(ResourceType.LAB)
						.capacity(35)
						.location("Lab Complex, Floor 2")
						.availabilityStart(LocalTime.of(9, 0))
						.availabilityEnd(LocalTime.of(17, 0))
						.status(ResourceStatus.ACTIVE)
						.amenities(List.of("PCs", "Switch Rack", "Smart Board"))
						.build(),
				ResourceDocument.builder()
						.name("Portable Camera Kit")
						.type(ResourceType.EQUIPMENT)
						.capacity(1)
						.location("Media Unit")
						.availabilityStart(LocalTime.of(8, 30))
						.availabilityEnd(LocalTime.of(16, 30))
						.status(ResourceStatus.ACTIVE)
						.amenities(List.of("Tripod", "Battery Pack"))
						.build()));
	}
}
