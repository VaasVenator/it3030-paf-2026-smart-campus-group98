package com.vaas.paf.ticket.dto;

import jakarta.validation.constraints.NotBlank;

public record AssignTechnicianRequest(
		@NotBlank(message = "Technician ID is required.") String technicianId,
		@NotBlank(message = "Technician name is required.") String technicianName) {
}

// This record represents the request body for assigning a technician to a ticket. It includes two fields, "technicianId" and "technicianName", both of which are annotated with @NotBlank to ensure that they are not empty or null when the request is made.