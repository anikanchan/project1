package com.ecommerce.service;

import com.ecommerce.dto.LogEntryRequest;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.cloudwatchlogs.CloudWatchLogsClient;
import software.amazon.awssdk.services.cloudwatchlogs.model.*;

@Service
@Slf4j
public class CloudWatchLoggingService {

    private CloudWatchLogsClient cloudWatchLogsClient;
    private boolean enabled = false;

    @Value("${cloudwatch.log-group-name:ecommerce-frontend-logs}")
    private String logGroupName;

    @Value("${cloudwatch.log-stream-name:frontend}")
    private String logStreamName;

    @Value("${cloudwatch.enabled:true}")
    private boolean cloudwatchEnabled;

    private String sequenceToken;

    public CloudWatchLoggingService() {
        // CloudWatch client will be initialized in @PostConstruct
    }

    @PostConstruct
    public void init() {
        if (!cloudwatchEnabled) {
            log.info("CloudWatch logging is disabled");
            return;
        }

        try {
            this.cloudWatchLogsClient = CloudWatchLogsClient.create();
            this.enabled = true;
            log.info("CloudWatch logging initialized");
            ensureLogGroupExists();
            ensureLogStreamExists();
        } catch (Exception e) {
            log.warn("CloudWatch logging disabled - AWS not available: {}", e.getMessage());
            this.enabled = false;
        }
    }

    private void ensureLogGroupExists() {
        try {
            cloudWatchLogsClient.createLogGroup(CreateLogGroupRequest.builder()
                    .logGroupName(logGroupName)
                    .build());
            log.info("Created CloudWatch log group: {}", logGroupName);
        } catch (ResourceAlreadyExistsException e) {
            log.debug("Log group already exists: {}", logGroupName);
        } catch (Exception e) {
            log.warn("Could not create log group: {}", e.getMessage());
        }
    }

    private void ensureLogStreamExists() {
        try {
            cloudWatchLogsClient.createLogStream(CreateLogStreamRequest.builder()
                    .logGroupName(logGroupName)
                    .logStreamName(logStreamName)
                    .build());
            log.info("Created CloudWatch log stream: {}", logStreamName);
        } catch (ResourceAlreadyExistsException e) {
            log.debug("Log stream already exists: {}", logStreamName);
            fetchSequenceToken();
        } catch (Exception e) {
            log.warn("Could not create log stream: {}", e.getMessage());
        }
    }

    private void fetchSequenceToken() {
        try {
            DescribeLogStreamsResponse response = cloudWatchLogsClient.describeLogStreams(
                    DescribeLogStreamsRequest.builder()
                            .logGroupName(logGroupName)
                            .logStreamNamePrefix(logStreamName)
                            .build());

            if (!response.logStreams().isEmpty()) {
                sequenceToken = response.logStreams().get(0).uploadSequenceToken();
            }
        } catch (Exception e) {
            log.warn("Could not fetch sequence token: {}", e.getMessage());
        }
    }

    public void sendLog(LogEntryRequest logEntry) {
        if (!enabled) {
            log.debug("CloudWatch disabled - logging locally: [{}] {}", logEntry.getLevel(), logEntry.getMessage());
            return;
        }

        try {
            String formattedMessage = formatLogMessage(logEntry);
            long timestamp = logEntry.getTimestamp() != null ? logEntry.getTimestamp() : System.currentTimeMillis();

            InputLogEvent logEvent = InputLogEvent.builder()
                    .message(formattedMessage)
                    .timestamp(timestamp)
                    .build();

            PutLogEventsRequest.Builder requestBuilder = PutLogEventsRequest.builder()
                    .logGroupName(logGroupName)
                    .logStreamName(logStreamName)
                    .logEvents(logEvent);

            if (sequenceToken != null) {
                requestBuilder.sequenceToken(sequenceToken);
            }

            PutLogEventsResponse response = cloudWatchLogsClient.putLogEvents(requestBuilder.build());
            sequenceToken = response.nextSequenceToken();

            log.debug("Log sent to CloudWatch: {}", logEntry.getLevel());
        } catch (InvalidSequenceTokenException e) {
            sequenceToken = e.expectedSequenceToken();
            sendLog(logEntry);
        } catch (Exception e) {
            log.error("Failed to send log to CloudWatch: {}", e.getMessage());
        }
    }

    private String formatLogMessage(LogEntryRequest logEntry) {
        StringBuilder sb = new StringBuilder();
        sb.append("[").append(logEntry.getLevel().toUpperCase()).append("] ");
        sb.append(logEntry.getMessage());

        if (logEntry.getSource() != null) {
            sb.append(" | source=").append(logEntry.getSource());
        }
        if (logEntry.getUrl() != null) {
            sb.append(" | url=").append(logEntry.getUrl());
        }
        if (logEntry.getUserAgent() != null) {
            sb.append(" | userAgent=").append(logEntry.getUserAgent());
        }

        return sb.toString();
    }
}