/**
 * Implementation by Member 2: Booking workflow + conflict checking.
 */
package com.vaas.paf.booking.controller;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.vaas.paf.booking.dto.BookingResponse;
import com.vaas.paf.booking.dto.CreateBookingRequest;
import com.vaas.paf.booking.dto.ReviewBookingRequest;
import com.vaas.paf.booking.dto.UpdateBookingRequest;
import com.vaas.paf.booking.model.BookingStatus;
import com.vaas.paf.booking.service.BookingService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

	private final BookingService bookingService;

	public BookingController(BookingService bookingService) {
		this.bookingService = bookingService;
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public BookingResponse create(@Valid @RequestBody CreateBookingRequest request) {
		return bookingService.create(request);
	}

	@GetMapping
	public List<BookingResponse> findAll(@RequestParam(required = false) BookingStatus status) {
		return bookingService.findAll(status);
	}

	@PatchMapping("/{bookingId}/review")
	public BookingResponse review(@PathVariable String bookingId, @Valid @RequestBody ReviewBookingRequest request) {
		return bookingService.review(bookingId, request);
	}

	@PatchMapping("/{bookingId}/cancel")
	public BookingResponse cancel(@PathVariable String bookingId) {
		return bookingService.cancel(bookingId);
	}

	@PutMapping("/{bookingId}")
	public BookingResponse update(@PathVariable String bookingId, @Valid @RequestBody UpdateBookingRequest request) {
		return bookingService.update(bookingId, request);
	}

	@DeleteMapping("/{bookingId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@PathVariable String bookingId) {
		bookingService.delete(bookingId);
	}
}
