package com.vaas.paf.resource.service;

import java.util.List;
import java.util.Locale;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import com.vaas.paf.common.AppException;
import com.vaas.paf.resource.dto.CreateResourceRequest;
import com.vaas.paf.resource.dto.ResourceListResponse;
import com.vaas.paf.resource.dto.ResourceResponse;
import com.vaas.paf.resource.dto.UpdateResourceRequest;
import com.vaas.paf.resource.model.ResourceDocument;
import com.vaas.paf.resource.model.ResourceStatus;
import com.vaas.paf.resource.model.ResourceType;
import com.vaas.paf.resource.repo.ResourceRepository;
import com.vaas.paf.security.AccessGuard;
import com.vaas.paf.security.UserRole;

@Service
public class ResourceService {
	private static final Logger logger = LoggerFactory.getLogger(ResourceService.class);
	private static final List<String> ALLOWED_SORT_FIELDS = List.of("name", "type", "capacity", "location", "status");

	private final ResourceRepository resourceRepository;
	private final AccessGuard accessGuard;
	private final MongoTemplate mongoTemplate;

	public ResourceService(ResourceRepository resourceRepository, AccessGuard accessGuard, MongoTemplate mongoTemplate) {
		this.resourceRepository = resourceRepository;
		this.accessGuard = accessGuard;
		this.mongoTemplate = mongoTemplate;
	}

	public ResourceResponse create(CreateResourceRequest request) {
		accessGuard.requireAnyRole(UserRole.ADMIN);
		validateAvailabilityWindow(request.availabilityStart(), request.availabilityEnd());

		ResourceDocument resource = ResourceDocument.builder()
				.name(request.name())
				.type(request.type())
				.capacity(request.capacity())
				.location(request.location())
				.availabilityStart(request.availabilityStart())
				.availabilityEnd(request.availabilityEnd())
				.status(request.status())
				.amenities(request.amenities() == null ? List.of() : request.amenities())
				.build();
		@SuppressWarnings("null")		ResourceDocument saved = resourceRepository.save(resource);
		logger.info("Resource created by {}: {}", accessGuard.currentUser().userId(), saved.getId());
		return toResponse(saved);
	}

	public ResourceListResponse findAll(
			ResourceType type,
			Integer minCapacity,
			String location,
			ResourceStatus status,
			int page,
			int size,
			String sortBy,
			String sortOrder) {
		if (page < 0) {
			throw new AppException(HttpStatus.BAD_REQUEST, "Page must be 0 or greater.");
		}
		if (size <= 0 || size > 100) {
			throw new AppException(HttpStatus.BAD_REQUEST, "Size must be between 1 and 100.");
		}

		String normalizedSortBy = normalizeSortBy(sortBy);
		Sort.Direction direction = parseDirection(sortOrder);

		Query baseQuery = new Query();
		if (type != null) {
			baseQuery.addCriteria(Criteria.where("type").is(type));
		}
		if (minCapacity != null) {
			baseQuery.addCriteria(Criteria.where("capacity").gte(minCapacity));
		}
		if (location != null && !location.isBlank()) {
			@SuppressWarnings("null")
			String param = location.trim();
			@SuppressWarnings("null")
			Criteria locationCriteria = Criteria.where("location").regex(param, "i");
			baseQuery.addCriteria(locationCriteria);
		}
		if (status != null) {
			baseQuery.addCriteria(Criteria.where("status").is(status));
		}

		long totalElements = mongoTemplate.count(baseQuery, ResourceDocument.class);
		int totalPages = (int) Math.ceil(totalElements / (double) size);

		@SuppressWarnings("null")
		Pageable pageable = PageRequest.of(page, size, Sort.by(direction, normalizedSortBy));
		Query dataQuery = baseQuery.with(pageable);

		List<ResourceResponse> content = mongoTemplate.find(dataQuery, ResourceDocument.class)
				.stream()
				.map(this::toResponse)
				.toList();

		return new ResourceListResponse(content, totalElements, totalPages, page, size);
	}

	public ResourceResponse findById(String id) {
		return toResponse(getDocument(id));
	}

	public ResourceDocument getDocument(String id) {
			@SuppressWarnings("null")
			ResourceDocument resource = resourceRepository.findById(id)
					.orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Resource not found."));
			return resource;
	}

	public ResourceResponse update(String id, UpdateResourceRequest request) {
		accessGuard.requireAnyRole(UserRole.ADMIN);
		validateAvailabilityWindow(request.availabilityStart(), request.availabilityEnd());

		ResourceDocument resource = getDocument(id);
		resource.setName(request.name());
		resource.setType(request.type());
		resource.setCapacity(request.capacity());
		resource.setLocation(request.location());
		resource.setAvailabilityStart(request.availabilityStart());
		resource.setAvailabilityEnd(request.availabilityEnd());
		resource.setStatus(request.status());
		resource.setAmenities(request.amenities() == null ? List.of() : request.amenities());

		ResourceDocument saved = resourceRepository.save(resource);
		logger.info("Resource updated by {}: {}", accessGuard.currentUser().userId(), saved.getId());
		return toResponse(saved);
	}

	@SuppressWarnings("null")
	public void delete(String id) {
		accessGuard.requireAnyRole(UserRole.ADMIN);
		@SuppressWarnings("null")
		boolean exists = resourceRepository.existsById(id);
		if (!exists) {
			throw new AppException(HttpStatus.NOT_FOUND, "Resource not found.");
		}
		resourceRepository.deleteById(id);
		logger.info("Resource deleted by {}: {}", accessGuard.currentUser().userId(), id);
	}

	private String normalizeSortBy(String sortBy) {
		String normalized = sortBy == null ? "name" : sortBy.trim().toLowerCase(Locale.ROOT);
		if (!ALLOWED_SORT_FIELDS.contains(normalized)) {
			throw new AppException(HttpStatus.BAD_REQUEST, "Invalid sortBy value.");
		}
		return normalized;
	}

	private Sort.Direction parseDirection(String sortOrder) {
		if (sortOrder == null || sortOrder.isBlank()) {
			return Sort.Direction.ASC;
		}
		try {
			return Sort.Direction.fromString(sortOrder);
		} catch (IllegalArgumentException exception) {
			throw new AppException(HttpStatus.BAD_REQUEST, "Invalid sortOrder value.");
		}
	}

	private void validateAvailabilityWindow(java.time.LocalTime start, java.time.LocalTime end) {
		if (!start.isBefore(end)) {
			throw new AppException(HttpStatus.BAD_REQUEST, "Availability start time must be before end time.");
		}
	}

	private ResourceResponse toResponse(ResourceDocument resource) {
		return new ResourceResponse(
				resource.getId(),
				resource.getName(),
				resource.getType(),
				resource.getCapacity(),
				resource.getLocation(),
				resource.getAvailabilityStart(),
				resource.getAvailabilityEnd(),
				resource.getStatus(),
				resource.getAmenities());
	}
}
