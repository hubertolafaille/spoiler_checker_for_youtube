package com.hubertolafaille.server.web.dto.response;

import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;

public record ErrorResponse(Integer httpCode,
                            HttpStatus httpStatus,
                            String errorMessage,
                            LocalDateTime date,
                            String errorId) {
}
