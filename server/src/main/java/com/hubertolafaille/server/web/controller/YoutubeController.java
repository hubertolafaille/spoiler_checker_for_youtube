package com.hubertolafaille.server.web.controller;


import com.hubertolafaille.server.domain.service.YoutubeService;
import com.hubertolafaille.server.web.dto.request.FetchYoutubeVideoInfoByYoutubeVideoIdListRequest;
import com.hubertolafaille.server.web.dto.response.FetchedYoutubeVideoInfoResponse;
import com.hubertolafaille.server.web.mapper.FetchedVideoListResponseMapper;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/youtube")
@AllArgsConstructor
public class YoutubeController {

    private final FetchedVideoListResponseMapper fetchedVideoListResponseMapper;
    private final YoutubeService youtubeService;

    @GetMapping("/fetch-video-info")
    public ResponseEntity<List<FetchedYoutubeVideoInfoResponse>> fetchVideoInfo(
            @RequestBody FetchYoutubeVideoInfoByYoutubeVideoIdListRequest fetchYoutubeVideoInfoByYoutubeVideoIdListRequest)
            throws GeneralSecurityException, IOException {
        log.info("GET /fetch-video-info");
        List<FetchedYoutubeVideoInfoResponse> fetchedYoutubeVideoInfoResponseList = fetchedVideoListResponseMapper.toFetchedYoutubeVideoInfoResponseList(
                youtubeService.fetchVideoDetailsSnippetByYoutubeVideoIdList(
                        fetchYoutubeVideoInfoByYoutubeVideoIdListRequest.youtubeVideoIdList()));
        return ResponseEntity.ok().body(fetchedYoutubeVideoInfoResponseList);
    }
}
