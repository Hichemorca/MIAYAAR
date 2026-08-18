CREATE TABLE `valuationRateLimitWindows` (
	`id` varchar(128) NOT NULL,
	`windowStart` timestamp NOT NULL,
	`requestCount` int NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `valuationRateLimitWindows_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `valuationRateLimitWindows_expires_idx` ON `valuationRateLimitWindows` (`expiresAt`);