package com.rms.service;

import com.rms.dto.SystemLogRequestDTO;
import com.rms.dto.SystemLogResponseDTO;
import com.rms.model.SystemLog;
import com.rms.repository.SystemLogRepository;
import com.rms.repository.UserRepository;
import com.rms.specification.SystemLogSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class SystemLogServiceImpl implements SystemLogService {

    private final SystemLogRepository systemLogRepository;
    private final UserRepository userRepository;

    /**
     * saving log to database
     * @param request
     */
    @Override
    public void saveLog(SystemLogRequestDTO request) {
        log.info("SAVE LOG CALLED - Action: {}, UserId: {}, Details: {}",
                request.getAction(), request.getUserId(), request.getDetails());
        try {
            SystemLog systemLog = SystemLog.builder()
                    .userId(request.getUserId())
                    .action(request.getAction())
                    .entityType(request.getEntityType())
                    .entityId(request.getEntityId())
                    .details(request.getDetails())
                    .ipAddress(request.getIpAddress())
                    .createdAt(LocalDateTime.now())
                    .build();

            systemLogRepository.save(systemLog);
            log.debug("System log saved: {} - {}", request.getAction(), request.getDetails());
        } catch (Exception e) {
            log.error("Failed to save system log: {}", e.getMessage());
        }
    }

    @Override
    public void saveLog(Long userId, String action, String entityType, Long entityId, String details) {
        saveLog(SystemLogRequestDTO.builder()
                .userId(userId)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .details(details)
                .build());
    }

    @Override
    public Page<SystemLogResponseDTO> getLogsWithFilters(Long userId, String action,
                                                         LocalDateTime startDate, LocalDateTime endDate,
                                                         Pageable pageable) {
        Specification<SystemLog> spec = SystemLogSpecification.withFilters(userId, action, startDate, endDate);
        return systemLogRepository.findAll(spec, pageable)
                .map(this::convertToResponseDTO);
    }

    @Override
    public Page<SystemLogResponseDTO> getLogsByUserId(Long userId, String action,
                                                      LocalDateTime startDate, LocalDateTime endDate,
                                                      Pageable pageable) {
        Specification<SystemLog> spec = SystemLogSpecification.withFilters(userId, action, startDate, endDate);
        return systemLogRepository.findAll(spec, pageable)
                .map(this::convertToResponseDTO);
    }

    @Override
    public SystemLogResponseDTO getLogById(Long logId) {
        SystemLog log = systemLogRepository.findById(logId)
                .orElseThrow(() -> new RuntimeException("Log not found with ID: " + logId));
        return convertToResponseDTO(log);
    }

    private SystemLogResponseDTO convertToResponseDTO(SystemLog log) {
        final String[] userName = {null};
        final String[] userRole = {null};

        if (log.getUserId() != null) {
            userRepository.findById(log.getUserId()).ifPresent(user -> {
                userName[0] = user.getUsername();
                userRole[0] = user.getRole().name();
            });
        }

        return SystemLogResponseDTO.builder()
                .id(log.getId())
                .userId(log.getUserId())
                .userName(userName[0])
                .userRole(userRole[0])
                .action(log.getAction())
                .entityType(log.getEntityType())
                .entityId(log.getEntityId())
                .details(log.getDetails())
                .ipAddress(log.getIpAddress())
                .createdAt(log.getCreatedAt())
                .build();
    }
}