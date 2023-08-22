package com.hubertolafaille.server.web.mapper;

import com.google.api.services.youtube.model.VideoListResponse;
import com.hubertolafaille.server.web.dto.response.FetchedYoutubeVideoInfoResponseDTO;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class FetchedVideoListResponseMapper {

    public List<FetchedYoutubeVideoInfoResponseDTO> toFetchedYoutubeVideoInfoResponseList(VideoListResponse videoListResponse) {
        return videoListResponse.getItems().stream()
                .map(video -> new FetchedYoutubeVideoInfoResponseDTO(
                        video.getId(),
                        video.getSnippet().getTitle(),
                        video.getSnippet().getDescription(),
                        video.getSnippet().getTags()
                ))
                .collect(Collectors.toList());
    }
}
