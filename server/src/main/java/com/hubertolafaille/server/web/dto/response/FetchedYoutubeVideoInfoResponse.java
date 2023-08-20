package com.hubertolafaille.server.web.dto.response;

import java.util.List;

public record FetchedYoutubeVideoInfoResponse(String id,
                                              String title,
                                              String description,
                                              List<String> tags) {
}
