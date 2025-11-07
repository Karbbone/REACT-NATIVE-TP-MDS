package mds.mobile.user;

public record UserLoginResponse(
        String token,
        UserResponse user
) {}

