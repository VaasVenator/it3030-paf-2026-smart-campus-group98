package com.vaas.paf.resource;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.time.LocalTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.HttpStatus;

import com.vaas.paf.common.AppException;
import com.vaas.paf.resource.dto.CreateResourceRequest;
import com.vaas.paf.resource.dto.UpdateResourceRequest;
import com.vaas.paf.resource.model.ResourceDocument;
import com.vaas.paf.resource.model.ResourceStatus;
import com.vaas.paf.resource.model.ResourceType;
import com.vaas.paf.resource.repo.ResourceRepository;
import com.vaas.paf.resource.service.ResourceService;
import com.vaas.paf.security.AccessGuard;
import com.vaas.paf.security.AuthenticatedUser;
import com.vaas.paf.security.UserRole;

class ResourceServiceTest {

    @Mock
    private ResourceRepository resourceRepository;

    @Mock
    private AccessGuard accessGuard;

    @Mock
    private MongoTemplate mongoTemplate;

    private ResourceService resourceService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        resourceService = new ResourceService(resourceRepository, accessGuard, mongoTemplate);
        when(accessGuard.currentUser()).thenReturn(new AuthenticatedUser("admin-1", "Admin", UserRole.ADMIN));
    }

    @Test
    void createShouldRejectInvalidAvailabilityWindow() {
        CreateResourceRequest request = new CreateResourceRequest(
                "Main Hall",
                ResourceType.LECTURE_HALL,
                100,
                "Block A",
                LocalTime.of(18, 0),
                LocalTime.of(10, 0),
                ResourceStatus.ACTIVE,
                List.of("Projector"));

        AppException exception = assertThrows(AppException.class, () -> resourceService.create(request));
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
    }

    @Test
    void updateShouldRejectInvalidAvailabilityWindow() {
        UpdateResourceRequest request = new UpdateResourceRequest(
                "Main Hall",
                ResourceType.LECTURE_HALL,
                100,
                "Block A",
                LocalTime.of(18, 0),
                LocalTime.of(10, 0),
                ResourceStatus.ACTIVE,
                List.of("Projector"));

        AppException exception = assertThrows(AppException.class, () -> resourceService.update("id-1", request));
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
    }

    @Test
    void findAllShouldRejectInvalidPage() {
        AppException exception = assertThrows(
                AppException.class,
                () -> resourceService.findAll(null, null, null, null, -1, 12, "name", "ASC"));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
    }

    @Test
    void findAllShouldRejectInvalidSortBy() {
        AppException exception = assertThrows(
                AppException.class,
                () -> resourceService.findAll(null, null, null, null, 0, 12, "createdAt", "ASC"));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
    }

    @Test
    void deleteShouldRejectMissingResource() {
        when(resourceRepository.existsById("missing")).thenReturn(false);

        AppException exception = assertThrows(AppException.class, () -> resourceService.delete("missing"));
        assertEquals(HttpStatus.NOT_FOUND, exception.getStatus());
    }

    @Test
    void createShouldMapAndReturnResponse() {
        CreateResourceRequest request = new CreateResourceRequest(
                "Networking Lab",
                ResourceType.LAB,
                40,
                "Lab Complex",
                LocalTime.of(9, 0),
                LocalTime.of(17, 0),
                ResourceStatus.ACTIVE,
                List.of("PCs", "Smart Board"));

        @SuppressWarnings({"null", "unused"})
        var saveAnswer = when(resourceRepository.save(any(ResourceDocument.class))).thenAnswer(invocation -> {
            ResourceDocument resource = invocation.getArgument(0);
            resource.setId("resource-1");
            return resource;
        });

        var response = resourceService.create(request);

        assertEquals("resource-1", response.id());
        assertEquals("Networking Lab", response.name());
        assertEquals(ResourceType.LAB, response.type());
        assertEquals(40, response.capacity());
    }
}
