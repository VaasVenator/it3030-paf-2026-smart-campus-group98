package com.vaas.paf.ticket.service;

import java.time.Instant;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.vaas.paf.common.AppException;
import com.vaas.paf.notification.model.NotificationType;
import com.vaas.paf.notification.service.NotificationService;
import com.vaas.paf.security.AccessGuard;
import com.vaas.paf.security.AuthenticatedUser;
import com.vaas.paf.security.UserRole;
import com.vaas.paf.ticket.dto.AddCommentRequest;
import com.vaas.paf.ticket.dto.TicketCommentResponse;
import com.vaas.paf.ticket.dto.UpdateCommentRequest;
import com.vaas.paf.ticket.model.TicketCommentDocument;
import com.vaas.paf.ticket.model.TicketDocument;
import com.vaas.paf.ticket.repo.TicketCommentRepository;

@Service
public class TicketCommentService {

	private final TicketCommentRepository ticketCommentRepository;
	private final TicketService ticketService;
	private final NotificationService notificationService;
	private final AccessGuard accessGuard;

	public TicketCommentService(
			TicketCommentRepository ticketCommentRepository,
			TicketService ticketService,
			NotificationService notificationService,
			AccessGuard accessGuard) {
		this.ticketCommentRepository = ticketCommentRepository;
		this.ticketService = ticketService;
		this.notificationService = notificationService;
		this.accessGuard = accessGuard;
	}

	public List<TicketCommentResponse> list(String ticketId) {
		ticketService.getById(ticketId);
		return ticketCommentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId)
				.stream()
				.map(this::toResponse)
				.toList();
	}

	public TicketCommentResponse add(String ticketId, AddCommentRequest request) {
		TicketDocument ticket = ticketService.getDocument(ticketId);
		ticketService.getById(ticketId);
		AuthenticatedUser user = accessGuard.currentUser();

		TicketCommentDocument comment = TicketCommentDocument.builder()
				.ticketId(ticketId)
				.authorId(user.userId())
				.authorName(user.displayName())
				.authorRole(user.role())
				.message(request.message())
				.createdAt(Instant.now())
				.updatedAt(Instant.now())
				.build();
		@SuppressWarnings("null")		TicketCommentDocument saved = ticketCommentRepository.save(comment);
		if (!ticket.getReporterId().equals(user.userId())) {
			notificationService.createForUser(
					ticket.getReporterId(),
					"New comment on your ticket",
					"%s added a new comment on your ticket.".formatted(user.displayName()),
					NotificationType.NEW_TICKET_COMMENT,
					ticketId);
		}
		return toResponse(saved);
	}

	public TicketCommentResponse update(String ticketId, String commentId, UpdateCommentRequest request) {
		ticketService.getById(ticketId);
		TicketCommentDocument comment = getComment(commentId);
		if (!comment.getTicketId().equals(ticketId)) {
			throw new AppException(HttpStatus.BAD_REQUEST, "Comment does not belong to this ticket.");
		}
		accessGuard.requireOwnerOrRole(comment.getAuthorId(), UserRole.ADMIN);
		comment.setMessage(request.message());
		comment.setUpdatedAt(Instant.now());
		return toResponse(ticketCommentRepository.save(comment));
	}

	public void delete(String ticketId, String commentId) {
		ticketService.getById(ticketId);
		TicketCommentDocument comment = getComment(commentId);
		if (!comment.getTicketId().equals(ticketId)) {
			throw new AppException(HttpStatus.BAD_REQUEST, "Comment does not belong to this ticket.");
		}
		accessGuard.requireOwnerOrRole(comment.getAuthorId(), UserRole.ADMIN);
		ticketCommentRepository.delete(comment);
	}

	private TicketCommentDocument getComment(String commentId) {
		@SuppressWarnings("null")
		TicketCommentDocument comment = ticketCommentRepository.findById(commentId)
				.orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Comment not found."));
		return comment;
	}

	private TicketCommentResponse toResponse(TicketCommentDocument comment) {
		return new TicketCommentResponse(
				comment.getId(),
				comment.getTicketId(),
				comment.getAuthorId(),
				comment.getAuthorName(),
				comment.getAuthorRole(),
				comment.getMessage(),
				comment.getCreatedAt(),
				comment.getUpdatedAt());
	}
}
