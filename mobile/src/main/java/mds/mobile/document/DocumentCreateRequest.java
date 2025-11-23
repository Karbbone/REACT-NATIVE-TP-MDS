package mds.mobile.document;

public record DocumentCreateRequest(
        String titre,
        String description,
        Long categorieId
) {}

