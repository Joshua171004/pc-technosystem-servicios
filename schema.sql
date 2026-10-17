CREATE TABLE `evidence` (
	`id` text PRIMARY KEY NOT NULL,
	`job` text NOT NULL,
	`name` text NOT NULL,
	`mime` text NOT NULL
);

CREATE TABLE `jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`client` text NOT NULL,
	`system` text NOT NULL,
	`date` text NOT NULL,
	`technician` text NOT NULL,
	`priority` text NOT NULL,
	`status` text DEFAULT 'Pendiente' NOT NULL,
	`description` text NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`created` text NOT NULL,
	`updated` text NOT NULL
);

CREATE TABLE `settings` (
	`id` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);

CREATE TABLE `technicians` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL
);

CREATE UNIQUE INDEX `technicians_email_unique` ON `technicians` (`email`);
ALTER TABLE `jobs` ADD `kind` text DEFAULT 'Trabajo' NOT NULL;
ALTER TABLE `jobs` ADD `time` text DEFAULT '' NOT NULL;
CREATE TABLE `client_contacts` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`active` integer DEFAULT 1 NOT NULL
);

CREATE UNIQUE INDEX `client_contacts_email_unique` ON `client_contacts` (`email`);
CREATE TABLE `clients` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);

CREATE TABLE `reports` (
	`id` text PRIMARY KEY NOT NULL,
	`job_id` text NOT NULL,
	`client_id` text NOT NULL,
	`payload` text NOT NULL,
	`published` text NOT NULL
);

CREATE UNIQUE INDEX `reports_job_id_unique` ON `reports` (`job_id`);
ALTER TABLE `jobs` ADD `client_id` text;
CREATE TABLE users (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL, salt TEXT NOT NULL, password TEXT NOT NULL, role TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1);
CREATE UNIQUE INDEX one_admin ON users(role) WHERE role='admin';
CREATE TABLE sessions (token TEXT PRIMARY KEY,user_id TEXT NOT NULL,expires INTEGER NOT NULL);
CREATE INDEX sessions_user ON sessions(user_id);
CREATE TABLE login_limits (id TEXT PRIMARY KEY, attempts INTEGER NOT NULL, reset INTEGER NOT NULL);
