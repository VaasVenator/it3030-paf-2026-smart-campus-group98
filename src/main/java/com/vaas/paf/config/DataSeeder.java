package com.vaas.paf.config;

import java.time.LocalTime;
import java.util.ArrayList;
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
		resourceRepository.deleteAll();

		List<ResourceDocument> resources = new ArrayList<>(List.of(
				ResourceDocument.builder()
						.name("SLIIT Auditorium")
						.type(ResourceType.LECTURE_HALL)
						.capacity(1000)
						.location("Main Building, Ground Floor")
						.availabilityStart(LocalTime.of(8, 0))
						.availabilityEnd(LocalTime.of(22, 0))
						.status(ResourceStatus.ACTIVE)
						.amenities(List.of("PA System", "Stage Lighting", "Projector", "Air Conditioning"))
						.build(),
				ResourceDocument.builder()
						.name("SLIIT Islands")
						.type(ResourceType.OPEN_AREA)
						.capacity(20)
						.location("Student Center")
						.availabilityStart(LocalTime.of(7, 0))
						.availabilityEnd(LocalTime.of(19, 0))
						.status(ResourceStatus.ACTIVE)
						.amenities(List.of("Open Air", "Whiteboard", "WiFi"))
						.build(),
				ResourceDocument.builder()
						.name("Bird Nest")
						.type(ResourceType.OPEN_AREA)
						.capacity(10)
						.location("Library, 3rd Floor")
						.availabilityStart(LocalTime.of(8, 30))
						.availabilityEnd(LocalTime.of(17, 30))
						.status(ResourceStatus.ACTIVE)
						.amenities(List.of("Glass Walls", "Smart TV", "Charging Ports"))
						.build(),
				ResourceDocument.builder()
						.name("New Building 14th Floor Main Hall")
						.type(ResourceType.LECTURE_HALL)
						.capacity(500)
						.location("New Building")
						.availabilityStart(LocalTime.of(8, 0))
						.availabilityEnd(LocalTime.of(20, 0))
						.status(ResourceStatus.ACTIVE)
						.amenities(List.of("Panoramic View", "Modern PA System", "High Speed WiFi"))
						.build(),
				ResourceDocument.builder()
						.name("SLIIT Grounds")
						.type(ResourceType.OPEN_AREA)
						.capacity(2000)
						.location("Campus Perimeter")
						.availabilityStart(LocalTime.of(6, 0))
						.availabilityEnd(LocalTime.of(18, 30))
						.status(ResourceStatus.ACTIVE)
						.amenities(List.of("Bleachers", "Changing Rooms", "Floodlights"))
						.build()));
		
		resourceRepository.saveAll(resources);
	}
}
