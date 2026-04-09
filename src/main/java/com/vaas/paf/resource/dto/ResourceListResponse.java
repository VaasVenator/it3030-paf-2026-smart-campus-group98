package com.vaas.paf.resource.dto;

import java.util.List;

public record ResourceListResponse(
		List<ResourceResponse> content,
		long totalElements,
		int totalPages,
		int currentPage,
		int pageSize) {
}