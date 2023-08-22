package com.hubertolafaille.server.web.dto.response;

import java.time.LocalDateTime;

public record ErrorResponseDTO(Integer httpCode,
                               String httpName,
                               String errorMessage,
                               LocalDateTime date,
                               String errorId) {
}
