package com.quickdevbase.web;

import com.quickdevbase.ai.AiGuideService;
import com.quickdevbase.ai.AiGuideService.Answer;
import com.quickdevbase.ai.AiGuideService.Request;
import com.quickdevbase.ai.AiGuideService.Status;
import com.quickdevbase.ai.AiDiscoveryService;
import com.quickdevbase.ai.AiDiscoveryService.DiscoveryResponse;
import com.quickdevbase.security.UserPrincipal;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/ai")
public class AiController {
    private final AiGuideService ai;
    private final AiDiscoveryService discovery;

    public AiController(AiGuideService ai, AiDiscoveryService discovery) {
        this.ai = ai;
        this.discovery = discovery;
    }

    @GetMapping("/status")
    Status status(@AuthenticationPrincipal UserPrincipal principal) {
        return ai.status(principal.account().id());
    }

    @PostMapping("/ask")
    Answer ask(@AuthenticationPrincipal UserPrincipal principal, @RequestBody(required = false) Request request) {
        return ai.ask(principal.account().id(), request);
    }

    @PostMapping(value = "/discover", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    DiscoveryResponse discover(
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestPart(name = "image", required = false) MultipartFile image,
        @RequestParam(name = "question", required = false) String question
    ) {
        return discovery.discover(principal.account().id(), image, question);
    }
}
