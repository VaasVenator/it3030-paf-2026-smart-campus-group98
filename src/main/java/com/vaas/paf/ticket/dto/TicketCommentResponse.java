package com.vaas.paf.ticket.dto;

import java.time.Instant;

import com.vaas.paf.security.UserRole;

public record TicketCommentResponse(
		String id,
		String ticketId,
		String authorId,
		String authorName,
		UserRole authorRole,
		String message,
		Instant createdAt,
		Instant updatedAt) {
}
// This record represents the response body for a ticket comment. It includes fields for the comment's ID, the associated ticket ID, the author's ID, name, and role, the comment message, and timestamps for when the comment was created and last updated.