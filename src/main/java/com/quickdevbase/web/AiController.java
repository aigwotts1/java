package com.quickdevbase.web;

import com.quickdevbase.ai.AiGuideService;
import com.quickdevbase.ai.AiGuideService.Answer;
import com.quickdevbase.ai.AiGuideService.Request;
import com.quickdevbase.ai.AiGuideService.Status;
import com.quickdevbase.security.UserPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class AiController {
    private final AiGuideService ai;

    public AiController(AiGuideService ai) {
        this.ai = ai;
    }

    @GetMapping("/status")
    Status status(@AuthenticationPrincipal UserPrincipal principal) {
        return ai.status(principal.account().id());
    }

    @PostMapping("/ask")
    Answer ask(@AuthenticationPrincipal UserPrincipal principal, @RequestBody(required = false) Request request) {
        return ai.ask(principal.account().id(), request);
    }
}
