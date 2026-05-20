package com.cinema.project.controller;

import com.cinema.project.payload.request.NewsRequest;
import com.cinema.project.service.NewsService;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/news")
@RequiredArgsConstructor
public class NewsController {

    private final NewsService newsService;

    @GetMapping
    public List<NewsRequest> getNews() {

        return newsService.getNews();
    }
}