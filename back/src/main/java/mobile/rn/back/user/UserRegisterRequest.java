package mobile.rn.back.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserRegisterRequest(
        @NotBlank(message = "email is required")
        @Email(message = "email must be valid")
        String email,

        @NotBlank(message = "password is required")
        @Size(min = 8, max = 64, message = "password must be between 8 and 64 characters")
        String password,

        @NotBlank(message = "firstName is required")
        @Size(max = 50, message = "firstName must be at most 50 characters")
        String firstName,

        @NotBlank(message = "lastName is required")
        @Size(max = 50, message = "lastName must be at most 50 characters")
        String lastName
) {}
