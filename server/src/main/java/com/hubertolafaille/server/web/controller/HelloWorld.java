package com.hubertolafaille.server.web.controller;


import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/hello-world")
public class HelloWorld {

    @GetMapping("")
    public void getHelloWorld() {
        log.info("GET /hello-world");
    }
}
