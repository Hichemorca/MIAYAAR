CREATE TABLE `methodologyVersions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`version` varchar(32) NOT NULL,
	`status` enum('draft','testing','review','approved','production') NOT NULL DEFAULT 'draft',
	`documentId` varchar(64) NOT NULL,
	`checksum` varchar(128) NOT NULL,
	`configuration` json NOT NULL,
	`changeSummary` text NOT NULL,
	`approvedBy` varchar(64),
	`approvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `methodologyVersions_id` PRIMARY KEY(`id`),
	CONSTRAINT `methodologyVersions_version_unique` UNIQUE(`version`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE TABLE `valuationAuditEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`valuationRequestId` varchar(64) NOT NULL,
	`stage` enum('validation','data','gis','rules','valuation','confidence','reporting') NOT NULL,
	`eventType` varchar(64) NOT NULL,
	`payload` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `valuationAuditEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `valuationRequests` (
	`id` varchar(64) NOT NULL,
	`userId` int,
	`methodologyVersion` varchar(32) NOT NULL,
	`propertyInput` json NOT NULL,
	`status` enum('received','completed','partial','rejected','failed') NOT NULL DEFAULT 'received',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `valuationRequests_id` PRIMARY KEY(`id`)
);
