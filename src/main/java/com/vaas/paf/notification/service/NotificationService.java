package com.vaas.paf.notification.service;

import java.time.Instant;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.vaas.paf.common.AppException;
import com.vaas.paf.notification.dto.NotificationResponse;
import com.vaas.paf.notification.model.NotificationDocument;
import com.vaas.paf.notification.model.NotificationType;
import com.vaas.paf.notification.repo.NotificationRepository;
import com.vaas.paf.security.AccessGuard;

@Service
public class NotificationService {

	private final NotificationRepository notificationRepository;
	private final AccessGuard accessGuard;

	public NotificationService(NotificationRepository notificationRepository, AccessGuard accessGuard) {
		this.notificationRepository = notificationRepository;
		this.accessGuard = accessGuard;
	}

	public void createForUser(String userId, String title, String message, NotificationType type, String referenceId) {
		NotificationDocument notification = NotificationDocument.builder()
				.userId(userId)
				.title(title)
				.message(message)
				.type(type)
				.referenceId(referenceId)
				.read(false)
				.createdAt(Instant.now())
				.build();
		@SuppressWarnings({"null", "unused"})
		NotificationDocument saved = notificationRepository.save(notification);
	}

	public List<NotificationResponse> currentUserNotifications() {
		return notificationRepository.findByUserIdOrderByCreatedAtDesc(accessGuard.currentUser().userId())
				.stream()
				.map(this::toResponse)
				.toList();
	}

	public NotificationResponse markAsRead(String notificationId) {
		@SuppressWarnings("null")
		NotificationDocument notification = notificationRepository.findById(notificationId)
				.orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Notification not found."));
		accessGuard.requireOwnerOrRole(notification.getUserId());
		notification.setRead(true);
		@SuppressWarnings("null")
		NotificationResponse result = toResponse(notificationRepository.save(notification));
		return result;
	}

	private NotificationResponse toResponse(NotificationDocument notification) {
		return new NotificationResponse(
				notification.getId(),
				notification.getUserId(),
				notification.getTitle(),
				notification.getMessage(),
				notification.getType(),
				notification.getReferenceId(),
				notification.isRead(),
				notification.getCreatedAt());
	}
}
