CREATE TABLE `marketTransactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceTransactionId` varchar(128) NOT NULL,
	`source` varchar(64) NOT NULL DEFAULT 'DLD',
	`sourceChecksum` varchar(128) NOT NULL,
	`transactionDate` timestamp NOT NULL,
	`district` varchar(160) NOT NULL,
	`propertyType` enum('apartment','villa','townhouse','office','retail','residential_land','warehouse') NOT NULL,
	`rawType` varchar(160) NOT NULL,
	`rawSubType` varchar(160),
	`areaSqm` double NOT NULL,
	`salePriceAed` double NOT NULL,
	`pricePerSqm` double NOT NULL,
	`evidenceStatus` enum('eligible','rejected') NOT NULL DEFAULT 'eligible',
	`rejectionReason` varchar(255),
	`ingestedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `marketTransactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `marketTransactions_sourceTransactionId_unique` UNIQUE(`sourceTransactionId`)
);
--> statement-breakpoint
CREATE INDEX `marketTransactions_district_type_date_idx` ON `marketTransactions` (`district`,`propertyType`,`transactionDate`);--> statement-breakpoint
CREATE INDEX `marketTransactions_type_date_idx` ON `marketTransactions` (`propertyType`,`transactionDate`);