package com.hubertolafaille.server.web.controller;


import com.hubertolafaille.server.domain.exception.EmptyVideoIdListException;
import com.hubertolafaille.server.domain.exception.VideoIdInvalidException;
import com.hubertolafaille.server.domain.exception.VideoIdListSizeExceededException;
import com.hubertolafaille.server.domain.service.YoutubeService;
import com.hubertolafaille.server.web.dto.response.FetchedYoutubeVideoInfoResponseDTO;
import com.hubertolafaille.server.web.mapper.FetchedVideoListResponseMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/youtube")
public class YoutubeController {

    private final FetchedVideoListResponseMapper fetchedVideoListResponseMapper;
    private final YoutubeService youtubeService;

    public YoutubeController(FetchedVideoListResponseMapper fetchedVideoListResponseMapper,
                             YoutubeService youtubeService) {
        this.fetchedVideoListResponseMapper = fetchedVideoListResponseMapper;
        this.youtubeService = youtubeService;
    }

    @GetMapping("/fetch-video-info")
    public ResponseEntity<List<FetchedYoutubeVideoInfoResponseDTO>> fetchVideoInfo(@RequestParam("video-id-list") List<String> videoIdList)
            throws GeneralSecurityException, IOException, VideoIdListSizeExceededException, VideoIdInvalidException, EmptyVideoIdListException {
        log.info("GET /fetch-video-info");
        youtubeService.validateVideoIdList(videoIdList);
        List<FetchedYoutubeVideoInfoResponseDTO> fetchedYoutubeVideoInfoResponseDTOList = fetchedVideoListResponseMapper.toFetchedYoutubeVideoInfoResponseList(
                youtubeService.fetchVideoDetailsSnippetByYoutubeVideoIdList(videoIdList));
        return ResponseEntity.ok().body(fetchedYoutubeVideoInfoResponseDTOList);
    }
}
