package com.debate.auth;

public abstract class OAuth2UserInfo {

    protected final java.util.Map<String, Object> attributes;

    protected OAuth2UserInfo(java.util.Map<String, Object> attributes) {
        this.attributes = attributes;
    }

    public abstract String getEmail();

    public abstract String getNickname();

    public abstract String getProvider();
}
