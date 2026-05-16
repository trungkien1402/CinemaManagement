package com.cinema.project.service;

import com.cinema.project.payload.request.NewsRequest;

import com.rometools.rome.feed.synd.SyndEntry;
import com.rometools.rome.feed.synd.SyndFeed;

import com.rometools.rome.io.SyndFeedInput;
import com.rometools.rome.io.XmlReader;

import org.springframework.stereotype.Service;

import java.net.URL;

import java.util.ArrayList;
import java.util.List;

@Service
public class NewsService {

    public List<NewsRequest> getNews() {

        List<NewsRequest>newsList = new ArrayList<>();

        try {

            URL url =
                    new URL(
                            "https://vnexpress.net/rss/giai-tri.rss"
                    );

            SyndFeedInput input =
                    new SyndFeedInput();

            SyndFeed feed =
                    input.build(
                            new XmlReader(url)
                    );

            for (SyndEntry entry : feed.getEntries()) {

                String description = "";

                if (entry.getDescription() != null) {
                    description =
                            entry.getDescription().getValue();
                }

                NewsRequest news =
                        new NewsRequest();

                news.setTitle(entry.getTitle());

                news.setDescription(description);

                news.setLink(entry.getLink());

                news.setPubDate(
                        entry.getPublishedDate() != null
                                ? entry.getPublishedDate().toString()
                                : ""
                );

                news.setImage(
                        extractImage(description)
                );

                newsList.add(news);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return newsList;
    }

    // Lấy ảnh từ description HTML
    private String extractImage(String html) {

        try {

            int start =
                    html.indexOf("src=\"") + 5;

            int end =
                    html.indexOf("\"", start);

            return html.substring(start, end);

        } catch (Exception e) {

            return "";
        }
    }
}