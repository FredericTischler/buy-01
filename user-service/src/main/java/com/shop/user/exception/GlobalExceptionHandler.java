package com.shop.user.exception;

import java.time.Instant;
import java.util.stream.Collectors;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidation(MethodArgumentNotValidException ex) {
        String detail = ex.getBindingResult().getFieldErrors().stream()
                .map(this::formatFieldError)
                .collect(Collectors.joining("; "));
        return buildProblem(HttpStatus.BAD_REQUEST, detail, "https://httpstatuses.com/400");
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ProblemDetail handleMessageNotReadable(HttpMessageNotReadableException ex) {
        return buildProblem(HttpStatus.BAD_REQUEST, "Malformed request body", "https://httpstatuses.com/400");
    }

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ProblemDetail handleEmailExists(EmailAlreadyExistsException ex) {
        return buildProblem(HttpStatus.CONFLICT, ex.getMessage(), "https://httpstatuses.com/409");
    }

    @ExceptionHandler({InvalidCredentialsException.class, BadCredentialsException.class})
    public ProblemDetail handleInvalidCredentials(RuntimeException ex) {
        return buildProblem(HttpStatus.UNAUTHORIZED, ex.getMessage(), "https://httpstatuses.com/401");
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ProblemDetail handleAccessDenied(AccessDeniedException ex) {
        return buildProblem(HttpStatus.FORBIDDEN, ex.getMessage(), "https://httpstatuses.com/403");
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ProblemDetail handleUserNotFound(UserNotFoundException ex) {
        return buildProblem(HttpStatus.NOT_FOUND, ex.getMessage(), "https://httpstatuses.com/404");
    }

    @ExceptionHandler(DuplicateKeyException.class)
    public ProblemDetail handleDuplicateKey(DuplicateKeyException ex) {
        return buildProblem(HttpStatus.CONFLICT, "Duplicate key value", "https://httpstatuses.com/409");
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ProblemDetail handleResponseStatus(ResponseStatusException ex) {
        ProblemDetail problem = buildProblem(
                HttpStatus.valueOf(ex.getStatusCode().value()),
                ex.getReason(),
                "https://httpstatuses.com/" + ex.getStatusCode().value());
        if (ex.getCause() != null) {
            problem.setProperty("cause", ex.getCause().getClass().getSimpleName());
        }
        return problem;
    }

    @ExceptionHandler(Exception.class)
    public ProblemDetail handleGeneric(Exception ex) {
        return buildProblem(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Unexpected error occurred",
                "https://httpstatuses.com/500");
    }

    private ProblemDetail buildProblem(HttpStatus status, String detail, String type) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, detail);
        problem.setType(type != null ? java.net.URI.create(type) : null);
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }

    private String formatFieldError(FieldError error) {
        return error.getField() + ": " + error.getDefaultMessage();
    }
}
