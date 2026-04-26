/**
 * Implementation by Member 3: Incident tickets + attachments + technician updates.
 */
package com.vaas.paf.ticket.controller;

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

import com.vaas.paf.ticket.dto.AddCommentRequest;
import com.vaas.paf.ticket.dto.AssignTechnicianRequest;
import com.vaas.paf.ticket.dto.CreateTicketRequest;
import com.vaas.paf.ticket.dto.TicketCommentResponse;
import com.vaas.paf.ticket.dto.TicketResponse;
import com.vaas.paf.ticket.dto.UpdateCommentRequest;
import com.vaas.paf.ticket.dto.UpdateTicketRequest;
import com.vaas.paf.ticket.dto.UpdateTicketStatusRequest;
import com.vaas.paf.ticket.service.TicketCommentService;
import com.vaas.paf.ticket.service.TicketService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

	private final TicketService ticketService;
	private final TicketCommentService ticketCommentService;

	public TicketController(TicketService ticketService, TicketCommentService ticketCommentService) {
		this.ticketService = ticketService;
		this.ticketCommentService = ticketCommentService;
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public TicketResponse create(@Valid @RequestBody CreateTicketRequest request) {
		return ticketService.create(request);
	}

	@GetMapping
	public List<TicketResponse> list() {
		return ticketService.findAll();
	}

	@GetMapping("/{ticketId}")
	public TicketResponse getById(@PathVariable String ticketId) {
		return ticketService.getById(ticketId);
	}

	@PatchMapping("/{ticketId}/assign")
	public TicketResponse assignTechnician(
			@PathVariable String ticketId,
			@Valid @RequestBody AssignTechnicianRequest request) {
		return ticketService.assignTechnician(ticketId, request);
	}

	@PatchMapping("/{ticketId}/status")
	public TicketResponse updateStatus(
			@PathVariable String ticketId,
			@Valid @RequestBody UpdateTicketStatusRequest request) {
		return ticketService.updateStatus(ticketId, request);
	}

	@PutMapping("/{ticketId}")
	public TicketResponse update(
			@PathVariable String ticketId,
			@Valid @RequestBody UpdateTicketRequest request) {
		return ticketService.update(ticketId, request);
	}

	@DeleteMapping("/{ticketId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@PathVariable String ticketId) {
		ticketService.delete(ticketId);
	}

	@GetMapping("/{ticketId}/comments")
	public List<TicketCommentResponse> listComments(@PathVariable String ticketId) {
		return ticketCommentService.list(ticketId);
	}

	@PostMapping("/{ticketId}/comments")
	@ResponseStatus(HttpStatus.CREATED)
	public TicketCommentResponse addComment(
			@PathVariable String ticketId,
			@Valid @RequestBody AddCommentRequest request) {
		return ticketCommentService.add(ticketId, request);
	}

	@PutMapping("/{ticketId}/comments/{commentId}")
	public TicketCommentResponse updateComment(
			@PathVariable String ticketId,
			@PathVariable String commentId,
			@Valid @RequestBody UpdateCommentRequest request) {
		return ticketCommentService.update(ticketId, commentId, request);
	}

	@DeleteMapping("/{ticketId}/comments/{commentId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deleteComment(@PathVariable String ticketId, @PathVariable String commentId) {
		ticketCommentService.delete(ticketId, commentId);
	}
}
