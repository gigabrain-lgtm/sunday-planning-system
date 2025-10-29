CREATE TABLE `key_result_objective_mappings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`keyResultId` varchar(64) NOT NULL,
	`objectiveId` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `key_result_objective_mappings_id` PRIMARY KEY(`id`),
	CONSTRAINT `key_result_objective_mappings_keyResultId_unique` UNIQUE(`keyResultId`)
);
