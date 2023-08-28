package com.hubertolafaille.server.web.dto.response;

import java.util.List;

public record FetchedYoutubeVideoInfoResponseDTO(String id,
                                                 String title,
                                                 String description,
                                                 List<String> tags) {
}
