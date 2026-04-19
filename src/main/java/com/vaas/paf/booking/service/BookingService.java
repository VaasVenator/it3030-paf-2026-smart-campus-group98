package com.vaas.paf.booking.service;

import java.time.Instant;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.vaas.paf.booking.dto.BookingResponse;
import com.vaas.paf.booking.dto.CreateBookingRequest;
import com.vaas.paf.booking.dto.ReviewBookingRequest;
import com.vaas.paf.booking.model.BookingDocument;
import com.vaas.paf.booking.model.BookingStatus;
import com.vaas.paf.booking.repo.BookingRepository;
import com.vaas.paf.common.AppException;
import com.vaas.paf.notification.model.NotificationType;
import com.vaas.paf.notification.service.NotificationService;
import com.vaas.paf.resource.model.ResourceDocument;
import com.vaas.paf.resource.model.ResourceStatus;
import com.vaas.paf.resource.service.ResourceService;
import com.vaas.paf.security.AccessGuard;
import com.vaas.paf.security.AuthenticatedUser;
import com.vaas.paf.security.UserRole;

@Service
public class BookingService {

	private static final Set<BookingStatus> BLOCKING_STATUSES = EnumSet.of(BookingStatus.PENDING, BookingStatus.APPROVED);

	private final BookingRepository bookingRepository;
	private final ResourceService resourceService;
	private final NotificationService notificationService;
	private final AccessGuard accessGuard;

	public BookingService(
			BookingRepository bookingRepository,
			ResourceService resourceService,
			NotificationService notificationService,
			AccessGuard accessGuard) {
		this.bookingRepository = bookingRepository;
		this.resourceService = resourceService;
		this.notificationService = notificationService;
		this.accessGuard = accessGuard;
	}

	public BookingResponse create(CreateBookingRequest request) {
		AuthenticatedUser user = accessGuard.currentUser();
		ResourceDocument resource = resourceService.getDocument(request.resourceId());
		validateBookingRequest(request, resource);

		BookingDocument booking = BookingDocument.builder()
				.resourceId(resource.getId())
				.resourceName(resource.getName())
				.requesterId(user.userId())
				.requesterName(user.displayName())
				.bookingDate(request.bookingDate())
				.startTime(request.startTime())
				.endTime(request.endTime())
				.purpose(request.purpose())
				.expectedAttendees(request.expectedAttendees())
				.status(BookingStatus.PENDING)
				.createdAt(Instant.now())
				.updatedAt(Instant.now())
				.build();

		@SuppressWarnings("null")
		BookingResponse result = toResponse(bookingRepository.save(booking));
		return result;
	}

	public List<BookingResponse> findAll(BookingStatus status) {
		AuthenticatedUser user = accessGuard.currentUser();
		List<BookingDocument> bookings = user.role() == UserRole.ADMIN
				? (status == null ? bookingRepository.findAll() : bookingRepository.findByStatus(status))
				: bookingRepository.findByRequesterId(user.userId());

		return bookings.stream()
				.filter(booking -> status == null || booking.getStatus() == status)
				.map(this::toResponse)
				.toList();
	}

	public BookingResponse review(String bookingId, ReviewBookingRequest request) {
		accessGuard.requireAnyRole(UserRole.ADMIN);
		BookingDocument booking = getDocument(bookingId);
		if (booking.getStatus() != BookingStatus.PENDING) {
			throw new AppException(HttpStatus.BAD_REQUEST, "Only pending bookings can be reviewed.");
		}

		String decision = request.decision().trim().toUpperCase();
		if (!decision.equals(BookingStatus.APPROVED.name()) && !decision.equals(BookingStatus.REJECTED.name())) {
			throw new AppException(HttpStatus.BAD_REQUEST, "Decision must be APPROVED or REJECTED.");
		}

		booking.setStatus(BookingStatus.valueOf(decision));
		booking.setDecisionReason(request.reason());
		booking.setReviewedBy(accessGuard.currentUser().displayName());
		booking.setReviewedAt(Instant.now());
		booking.setUpdatedAt(Instant.now());
		BookingDocument saved = bookingRepository.save(booking);

		notificationService.createForUser(
				saved.getRequesterId(),
				"Booking %s".formatted(saved.getStatus().name().toLowerCase()),
				"Your booking for %s on %s was %s.".formatted(
						saved.getResourceName(),
						saved.getBookingDate(),
						saved.getStatus().name().toLowerCase()),
				NotificationType.BOOKING_STATUS_CHANGED,
				saved.getId());

		return toResponse(saved);
	}

	public BookingResponse cancel(String bookingId) {
		BookingDocument booking = getDocument(bookingId);
		accessGuard.requireOwnerOrRole(booking.getRequesterId(), UserRole.ADMIN);
		if (booking.getStatus() == BookingStatus.REJECTED || booking.getStatus() == BookingStatus.CANCELLED) {
			throw new AppException(HttpStatus.BAD_REQUEST, "This booking cannot be cancelled.");
		}

		booking.setStatus(BookingStatus.CANCELLED);
		booking.setUpdatedAt(Instant.now());
		return toResponse(bookingRepository.save(booking));
	}

	public BookingDocument getDocument(String bookingId) {
			@SuppressWarnings("null")
			BookingDocument booking = bookingRepository.findById(bookingId)
					.orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Booking not found."));
			return booking;
	}

	private void validateBookingRequest(CreateBookingRequest request, ResourceDocument resource) {
		if (resource.getStatus() != ResourceStatus.ACTIVE) {
			throw new AppException(HttpStatus.BAD_REQUEST, "Bookings are allowed only for active resources.");
		}
		if (!request.startTime().isBefore(request.endTime())) {
			throw new AppException(HttpStatus.BAD_REQUEST, "Booking start time must be before end time.");
		}
		if (request.startTime().isBefore(resource.getAvailabilityStart()) || request.endTime().isAfter(resource.getAvailabilityEnd())) {
			throw new AppException(HttpStatus.BAD_REQUEST, "Booking must be within the resource availability window.");
		}
		if (request.expectedAttendees() > resource.getCapacity()) {
			throw new AppException(HttpStatus.BAD_REQUEST, "Expected attendees exceed the resource capacity.");
		}

		boolean hasConflict = !bookingRepository.findConflicts(
				resource.getId(),
				request.bookingDate(),
				BLOCKING_STATUSES,
				request.startTime(),
				request.endTime()).isEmpty();
		if (hasConflict) {
			throw new AppException(HttpStatus.CONFLICT, "The selected time range overlaps with an existing booking.");
		}
	}

	private BookingResponse toResponse(BookingDocument booking) {
		return new BookingResponse(
				booking.getId(),
				booking.getResourceId(),
				booking.getResourceName(),
				booking.getRequesterId(),
				booking.getRequesterName(),
				booking.getBookingDate(),
				booking.getStartTime(),
				booking.getEndTime(),
				booking.getPurpose(),
				booking.getExpectedAttendees(),
				booking.getStatus(),
				booking.getDecisionReason(),
				booking.getReviewedBy(),
				booking.getReviewedAt(),
				booking.getCreatedAt(),
				booking.getUpdatedAt());
	}
}
