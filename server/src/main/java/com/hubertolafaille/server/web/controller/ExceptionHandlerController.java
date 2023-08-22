package com.hubertolafaille.server.web.controller;

import com.hubertolafaille.server.domain.exception.VideoIdInvalidException;
import com.hubertolafaille.server.domain.exception.VideoIdListSizeExceededException;
import com.hubertolafaille.server.web.dto.response.ErrorResponseDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@RestControllerAdvice
public class ExceptionHandlerController {

    private ErrorResponseDTO generateErrorResponseDTO(Exception exception, HttpStatus httpStatus, String errorMessage) {
        String errorId = UUID.randomUUID().toString();
        log.error("[ErrorId] = {} : [ErrorMessage] = {}", errorId, exception.getMessage());
        return new ErrorResponseDTO(
                        httpStatus.value(),
                        httpStatus.name(),
                        errorMessage,
                        LocalDateTime.now(),
                        errorId);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDTO> unknownException(Exception exception) {
        return ResponseEntity.internalServerError().body(generateErrorResponseDTO(exception, HttpStatus.INTERNAL_SERVER_ERROR, "unknown_error"));
    }

    @ExceptionHandler(VideoIdListSizeExceededException.class)
    public ResponseEntity<ErrorResponseDTO> videoIdListSizeExceededException(VideoIdListSizeExceededException exception) {
        return ResponseEntity.badRequest().body(generateErrorResponseDTO(exception, HttpStatus.BAD_REQUEST, "allowed_list_size_exceeded_error"));
    }

    @ExceptionHandler(VideoIdInvalidException.class)
    public ResponseEntity<ErrorResponseDTO> videoIdInvalidException(VideoIdInvalidException exception) {
        return ResponseEntity.badRequest().body(generateErrorResponseDTO(exception, HttpStatus.BAD_REQUEST, "video_id_invalid"));
    }
}
