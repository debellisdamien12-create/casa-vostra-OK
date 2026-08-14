CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectType` varchar(128) NOT NULL,
	`projectNature` varchar(64) NOT NULL,
	`surface` varchar(64),
	`budget` varchar(64),
	`supplyScope` varchar(128),
	`timeline` varchar(64),
	`location` varchar(128),
	`details` text,
	`mediaSummary` text,
	`contactName` varchar(128),
	`contactPhone` varchar(64) NOT NULL,
	`contactEmail` varchar(320) NOT NULL,
	`selectedSlot` varchar(128),
	`status` varchar(32) NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
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
