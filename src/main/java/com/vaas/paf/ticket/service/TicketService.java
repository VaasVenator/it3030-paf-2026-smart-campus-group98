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
import com.vaas.paf.ticket.dto.AssignTechnicianRequest;
import com.vaas.paf.ticket.dto.CreateTicketRequest;
import com.vaas.paf.ticket.dto.TicketResponse;
import com.vaas.paf.ticket.dto.UpdateTicketStatusRequest;
import com.vaas.paf.ticket.model.TicketDocument;
import com.vaas.paf.ticket.model.TicketStatus;
import com.vaas.paf.ticket.repo.TicketRepository;

@Service
public class TicketService {

	private final TicketRepository ticketRepository;
	private final NotificationService notificationService;
	private final AccessGuard accessGuard;

	public TicketService(
			TicketRepository ticketRepository,
			NotificationService notificationService,
			AccessGuard accessGuard) {
		this.ticketRepository = ticketRepository;
		this.notificationService = notificationService;
		this.accessGuard = accessGuard;
	}

	public TicketResponse create(CreateTicketRequest request) {
		validateAttachments(request.attachmentUrls());
		AuthenticatedUser user = accessGuard.currentUser();

		TicketDocument ticket = TicketDocument.builder()
				.resourceId(request.resourceId())
				.location(request.location())
				.category(request.category())
				.description(request.description())
				.priority(request.priority())
				.preferredContact(request.preferredContact())
				.attachmentUrls(request.attachmentUrls() == null ? List.of() : request.attachmentUrls())
				.status(TicketStatus.OPEN)
				.reporterId(user.userId())
				.reporterName(user.displayName())
				.createdAt(Instant.now())
				.updatedAt(Instant.now())
				.build();

		@SuppressWarnings("null")
		TicketResponse result = toResponse(ticketRepository.save(ticket));
		return result;
	}

	public List<TicketResponse> findAll() {
		AuthenticatedUser user = accessGuard.currentUser();
		List<TicketDocument> tickets = switch (user.role()) {
			case ADMIN -> ticketRepository.findAll();
			case TECHNICIAN -> ticketRepository.findByAssignedTechnicianId(user.userId());
			case USER -> ticketRepository.findByReporterId(user.userId());
		};

		return tickets.stream().map(this::toResponse).toList();
	}

	public TicketResponse getById(String ticketId) {
		TicketDocument ticket = getDocument(ticketId);
		ensureTicketVisible(ticket);
		return toResponse(ticket);
	}

	public TicketResponse assignTechnician(String ticketId, AssignTechnicianRequest request) {
		accessGuard.requireAnyRole(UserRole.ADMIN);
		TicketDocument ticket = getDocument(ticketId);
		ticket.setAssignedTechnicianId(request.technicianId());
		ticket.setAssignedTechnicianName(request.technicianName());
		ticket.setUpdatedAt(Instant.now());
		return toResponse(ticketRepository.save(ticket));
	}

	public TicketResponse updateStatus(String ticketId, UpdateTicketStatusRequest request) {
		TicketDocument ticket = getDocument(ticketId);
		AuthenticatedUser user = accessGuard.currentUser();

		if (user.role() == UserRole.USER && !ticket.getReporterId().equals(user.userId())) {
			throw new AppException(HttpStatus.FORBIDDEN, "You can update only your own tickets.");
		}
		if (user.role() == UserRole.USER && !request.status().equalsIgnoreCase(TicketStatus.CLOSED.name())) {
			throw new AppException(HttpStatus.FORBIDDEN, "Users can only close their own resolved tickets.");
		}

		TicketStatus nextStatus = parseStatus(request.status());
		validateTransition(ticket.getStatus(), nextStatus, user.role());
		ticket.setStatus(nextStatus);
		ticket.setResolutionNotes(request.resolutionNotes());
		ticket.setRejectionReason(request.rejectionReason());
		ticket.setUpdatedAt(Instant.now());

		TicketDocument saved = ticketRepository.save(ticket);
		notificationService.createForUser(
				saved.getReporterId(),
				"Ticket status updated",
				"Your ticket at %s is now %s.".formatted(saved.getLocation(), saved.getStatus().name()),
				NotificationType.TICKET_STATUS_CHANGED,
				saved.getId());

		return toResponse(saved);
	}

	public TicketDocument getDocument(String ticketId) {
		@SuppressWarnings("null")
		TicketDocument ticket = ticketRepository.findById(ticketId)
				.orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Ticket not found."));
		return ticket;
	}

	private void ensureTicketVisible(TicketDocument ticket) {
		AuthenticatedUser user = accessGuard.currentUser();
		if (user.role() == UserRole.ADMIN) {
			return;
		}
		if (user.role() == UserRole.TECHNICIAN && user.userId().equals(ticket.getAssignedTechnicianId())) {
			return;
		}
		if (user.userId().equals(ticket.getReporterId())) {
			return;
		}
		throw new AppException(HttpStatus.FORBIDDEN, "You do not have access to this ticket.");
	}

	private void validateAttachments(List<String> attachmentUrls) {
		if (attachmentUrls != null && attachmentUrls.size() > 3) {
			throw new AppException(HttpStatus.BAD_REQUEST, "A ticket can include up to 3 image attachments.");
		}
	}

	private TicketStatus parseStatus(String statusValue) {
		try {
			return TicketStatus.valueOf(statusValue.trim().toUpperCase());
		} catch (IllegalArgumentException exception) {
			throw new AppException(HttpStatus.BAD_REQUEST, "Unsupported ticket status.");
		}
	}

	private void validateTransition(TicketStatus currentStatus, TicketStatus nextStatus, UserRole role) {
		boolean valid = switch (currentStatus) {
			case OPEN -> nextStatus == TicketStatus.IN_PROGRESS || nextStatus == TicketStatus.REJECTED;
			case IN_PROGRESS -> nextStatus == TicketStatus.RESOLVED || nextStatus == TicketStatus.REJECTED;
			case RESOLVED -> nextStatus == TicketStatus.CLOSED;
			case CLOSED, REJECTED -> false;
		};

		if (!valid) {
			throw new AppException(HttpStatus.BAD_REQUEST, "Invalid ticket status transition.");
		}
		if (nextStatus == TicketStatus.REJECTED && role != UserRole.ADMIN) {
			throw new AppException(HttpStatus.FORBIDDEN, "Only admins can reject tickets.");
		}
		if ((currentStatus == TicketStatus.OPEN || currentStatus == TicketStatus.IN_PROGRESS) && role == UserRole.USER) {
			throw new AppException(HttpStatus.FORBIDDEN, "Users cannot perform this ticket transition.");
		}
	}

	private TicketResponse toResponse(TicketDocument ticket) {
		return new TicketResponse(
				ticket.getId(),
				ticket.getResourceId(),
				ticket.getLocation(),
				ticket.getCategory(),
				ticket.getDescription(),
				ticket.getPriority(),
				ticket.getPreferredContact(),
				ticket.getAttachmentUrls(),
				ticket.getStatus(),
				ticket.getRejectionReason(),
				ticket.getResolutionNotes(),
				ticket.getReporterId(),
				ticket.getReporterName(),
				ticket.getAssignedTechnicianId(),
				ticket.getAssignedTechnicianName(),
				ticket.getCreatedAt(),
				ticket.getUpdatedAt());
	}
}
