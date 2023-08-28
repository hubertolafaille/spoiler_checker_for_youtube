package com.hubertolafaille.server.domain.service;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.youtube.YouTube;
import com.google.api.services.youtube.model.VideoListResponse;
import com.hubertolafaille.server.domain.exception.EmptyVideoIdListException;
import com.hubertolafaille.server.domain.exception.VideoIdInvalidException;
import com.hubertolafaille.server.domain.exception.VideoIdListSizeExceededException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.List;

@Service
public class YoutubeService {

    private final String youtubeApplicationName;
    private final String youtubeApiKey;
    private final JsonFactory jsonFactory;

    public YoutubeService(@Value("${youtube.application.name}") String youtubeApplicationName,
                          @Value("${youtube.api.key}") String youtubeApiKey) {
        this.youtubeApplicationName = youtubeApplicationName;
        this.youtubeApiKey = youtubeApiKey;
        this.jsonFactory = GsonFactory.getDefaultInstance();
    }

    private YouTube getYoutubeClient() throws GeneralSecurityException, IOException {
            final NetHttpTransport netHttpTransport = GoogleNetHttpTransport.newTrustedTransport();
            return new YouTube.Builder(netHttpTransport, jsonFactory, null)
                    .setApplicationName(youtubeApplicationName)
                    .build();
    }

    public VideoListResponse fetchVideoDetailsSnippetByYoutubeVideoIdList(List<String> youtubeVideoIdList) throws GeneralSecurityException, IOException {
        YouTube youtubeClient = getYoutubeClient();
        YouTube.Videos.List request = youtubeClient.videos()
                .list(List.of("snippet"));
        return request.setKey(youtubeApiKey)
                .setId(youtubeVideoIdList)
                .execute();
    }

    public void validateVideoIdList(List<String> videoIdList) throws VideoIdListSizeExceededException, VideoIdInvalidException, EmptyVideoIdListException {
        if (videoIdList.isEmpty()) {
            throw new EmptyVideoIdListException("The provided list is empty");
        }
        else if (videoIdList.size() > 50) {
            throw new VideoIdListSizeExceededException("Max allowed list size is 50, but the provided list contains more");
        }
        else if (videoIdList.stream().anyMatch(s -> s.length() != 11)) {
            throw new VideoIdInvalidException("Invalid video id found");
        }
    }
}
