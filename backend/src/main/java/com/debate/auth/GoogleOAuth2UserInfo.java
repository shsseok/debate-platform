package com.debate.auth;

import java.util.Map;

public class GoogleOAuth2UserInfo extends OAuth2UserInfo {

    public GoogleOAuth2UserInfo(Map<String, Object> attributes) {
        super(attributes);
    }

    @Override
    public String getEmail() {
        return (String) attributes.get("email");
    }

    @Override
    public String getNickname() {
        String name = (String) attributes.get("name");
        return name != null ? name : getEmail().split("@")[0];
    }

    @Override
    public String getProvider() {
        return "GOOGLE";
    }
}
