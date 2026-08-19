CREATE TABLE `dldImportIssues` (
	`id` int AUTO_INCREMENT NOT NULL,
	`importRunId` varchar(64) NOT NULL,
	`recordIndex` int NOT NULL,
	`issueType` enum('duplicate','rejected','invalid') NOT NULL,
	`reason` varchar(255) NOT NULL,
	`sourceTransactionId` varchar(128),
	`recordFingerprint` varchar(128) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dldImportIssues_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dldImportRuns` (
	`id` varchar(64) NOT NULL,
	`sourceLabel` varchar(255) NOT NULL,
	`sourceChecksum` varchar(128) NOT NULL,
	`recordsRead` int NOT NULL,
	`normalizedRecords` int NOT NULL,
	`uniqueTransactionIds` int NOT NULL,
	`duplicateTransactionIds` int NOT NULL,
	`eligibleRecords` int NOT NULL,
	`rejectedRecords` int NOT NULL,
	`skippedRecords` int NOT NULL,
	`status` enum('running','completed','failed') NOT NULL,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `dldImportRuns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `dldImportIssues_run_type_idx` ON `dldImportIssues` (`importRunId`,`issueType`);--> statement-breakpoint
CREATE INDEX `dldImportRuns_source_checksum_idx` ON `dldImportRuns` (`sourceChecksum`);
