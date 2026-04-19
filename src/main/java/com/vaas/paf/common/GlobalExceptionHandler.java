package com.vaas.paf.common;

import java.time.Instant;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(AppException.class)
	public ResponseEntity<ApiError> handleAppException(AppException exception, HttpServletRequest request) {
		@SuppressWarnings("null")
		HttpStatus status = exception.getStatus();
		@SuppressWarnings("null")
		ResponseEntity<ApiError> response = ResponseEntity.status(status)
				.body(new ApiError(
						Instant.now(),
						status.value(),
						status.getReasonPhrase(),
						exception.getMessage(),
						request.getRequestURI(),
						List.of()));
		return response;
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ApiError> handleValidationException(
			MethodArgumentNotValidException exception,
			HttpServletRequest request) {
		List<String> validationErrors = exception.getBindingResult()
				.getFieldErrors()
				.stream()
				.map(FieldError::getDefaultMessage)
				.toList();

		return ResponseEntity.badRequest()
				.body(new ApiError(
						Instant.now(),
						HttpStatus.BAD_REQUEST.value(),
						HttpStatus.BAD_REQUEST.getReasonPhrase(),
						"Validation failed",
						request.getRequestURI(),
						validationErrors));
	}

	@ExceptionHandler(MethodArgumentTypeMismatchException.class)
	public ResponseEntity<ApiError> handleTypeMismatch(
			MethodArgumentTypeMismatchException exception,
			HttpServletRequest request) {
		return ResponseEntity.badRequest()
				.body(new ApiError(
						Instant.now(),
						HttpStatus.BAD_REQUEST.value(),
						HttpStatus.BAD_REQUEST.getReasonPhrase(),
						"Invalid value for parameter '%s'".formatted(exception.getName()),
						request.getRequestURI(),
						List.of()));
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ApiError> handleUnhandledException(Exception exception, HttpServletRequest request) {
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(new ApiError(
						Instant.now(),
						HttpStatus.INTERNAL_SERVER_ERROR.value(),
						HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase(),
						exception.getMessage(),
						request.getRequestURI(),
						List.of()));
	}
}
