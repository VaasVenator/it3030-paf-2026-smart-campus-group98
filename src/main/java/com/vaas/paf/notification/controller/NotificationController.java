/**
 * Implementation by Member 4: Notifications + role management + OAuth integration improvements.
 */
package com.vaas.paf.notification.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.vaas.paf.notification.dto.CreateNotificationRequest;
import com.vaas.paf.notification.dto.NotificationResponse;
import com.vaas.paf.notification.dto.UpdateNotificationRequest;

import jakarta.validation.Valid;
import com.vaas.paf.notification.service.NotificationService;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

	private final NotificationService notificationService;

	public NotificationController(NotificationService notificationService) {
		this.notificationService = notificationService;
	}

	@GetMapping
	public List<NotificationResponse> listMine() {
		return notificationService.currentUserNotifications();
	}

	@PatchMapping("/{notificationId}/read")
	public NotificationResponse markAsRead(@PathVariable String notificationId) {
		return notificationService.markAsRead(notificationId);
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public NotificationResponse create(@Valid @RequestBody CreateNotificationRequest request) {
		return notificationService.create(request);
	}

	@PutMapping("/{notificationId}")
	public NotificationResponse update(
			@PathVariable String notificationId,
			@Valid @RequestBody UpdateNotificationRequest request) {
		return notificationService.update(notificationId, request);
	}

	@DeleteMapping("/{notificationId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@PathVariable String notificationId) {
		notificationService.delete(notificationId);
	}
}
