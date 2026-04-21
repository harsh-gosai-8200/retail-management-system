package com.rms.service;

import com.rms.dto.SystemLogRequestDTO;
import com.rms.dto.SystemLogResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface SystemLogService {

    void saveLog(SystemLogRequestDTO request);


    void saveLog(Long userId, String action, String entityType, Long entityId, String details);


    Page<SystemLogResponseDTO> getLogsWithFilters(Long userId, String action,
                                                  LocalDateTime startDate, LocalDateTime endDate,
                                                  Pageable pageable);

    Page<SystemLogResponseDTO> getLogsByUserId(Long userId, String action,
                                               LocalDateTime startDate, LocalDateTime endDate,
                                               Pageable pageable);

    SystemLogResponseDTO getLogById(Long logId);
}