package com.vaas.paf.resource.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.vaas.paf.resource.dto.CreateResourceRequest;
import com.vaas.paf.resource.dto.ResourceListResponse;
import com.vaas.paf.resource.dto.ResourceResponse;
import com.vaas.paf.resource.dto.UpdateResourceRequest;
import com.vaas.paf.resource.model.ResourceStatus;
import com.vaas.paf.resource.model.ResourceType;
import com.vaas.paf.resource.service.ResourceService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {

	private final ResourceService resourceService;

	public ResourceController(ResourceService resourceService) {
		this.resourceService = resourceService;
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public ResourceResponse create(@Valid @RequestBody CreateResourceRequest request) {
		return resourceService.create(request);
	}

	@GetMapping
	public ResourceListResponse findAll(
			@RequestParam(required = false) ResourceType type,
			@RequestParam(required = false) Integer minCapacity,
			@RequestParam(required = false) String location,
			@RequestParam(required = false) ResourceStatus status,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "12") int size,
			@RequestParam(defaultValue = "name") String sortBy,
			@RequestParam(defaultValue = "ASC") String sortOrder) {
		return resourceService.findAll(type, minCapacity, location, status, page, size, sortBy, sortOrder);
	}

	@GetMapping("/{id}")
	public ResourceResponse findById(@PathVariable String id) {
		return resourceService.findById(id);
	}

	@PutMapping("/{id}")
	public ResourceResponse update(@PathVariable String id, @Valid @RequestBody UpdateResourceRequest request) {
		return resourceService.update(id, request);
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@PathVariable String id) {
		resourceService.delete(id);
	}
}
