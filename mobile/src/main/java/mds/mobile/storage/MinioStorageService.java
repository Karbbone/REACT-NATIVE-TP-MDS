package mds.mobile.storage;

import io.minio.GetObjectArgs;
import io.minio.GetObjectResponse;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.StatObjectArgs;
import io.minio.StatObjectResponse;
import io.minio.errors.MinioException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.UUID;

@Service
public class MinioStorageService {

    private final MinioClient minioClient;
    private final String bucketName;

    public MinioStorageService(MinioClient minioClient, @Value("${minio.bucket}") String bucketName) {
        this.minioClient = minioClient;
        this.bucketName = bucketName;
    }

    public String upload(MultipartFile file, String objectName) {
        try {
            if (objectName == null || objectName.isBlank()) {
                objectName = UUID.randomUUID() + "-" + file.getOriginalFilename();
            }

            String contentType = file.getContentType();
            if (contentType == null || contentType.isBlank()) {
                contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
            }

            try (InputStream is = file.getInputStream()) {
                PutObjectArgs args = PutObjectArgs.builder()
                        .bucket(bucketName)
                        .object(objectName)
                        .contentType(contentType)
                        .stream(is, file.getSize(), -1)
                        .build();
                minioClient.putObject(args);
            }

            return objectName; // we return the key
        } catch (MinioException me) {
            throw new RuntimeException("MinIO error: " + me.getMessage(), me);
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload file to MinIO", e);
        }
    }

    public GetObjectResponse getObject(String objectName) {
        try {
            return minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .build()
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to download file from MinIO", e);
        }
    }

    public StatObjectResponse stat(String objectName) {
        try {
            return minioClient.statObject(
                    StatObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .build()
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to stat object in MinIO", e);
        }
    }
}
