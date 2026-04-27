package com.vaas.paf.ticket.dto;

import jakarta.validation.constraints.NotBlank;

public record AddCommentRequest(@NotBlank(message = "Comment message is required.") String message) {
}

// This record represents the request body for adding a comment to a ticket. It includes a single field, "message", which is annotated with @NotBlank to ensure that it is not empty or null when the request is made.