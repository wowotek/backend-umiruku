CREATE TABLE `customer` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`fullname` varchar(512) NOT NULL,
	`phone_number` varchar(16) NOT NULL,
	`kelurahan_id` int NOT NULL,
	`kecamatan_id` int NOT NULL,
	`kabupaten_id` int NOT NULL,
	`provinsi_id` int NOT NULL,
	`kodepos_id` int NOT NULL,
	`full_address` text NOT NULL,
	`coord_lati` decimal(11,8) NOT NULL,
	`coord_long` decimal(11,8) NOT NULL,
	CONSTRAINT `customer_id` PRIMARY KEY(`id`),
	CONSTRAINT `customer_user_id_unique` UNIQUE(`user_id`),
	CONSTRAINT `customer_phone_number_unique` UNIQUE(`phone_number`)
);
--> statement-breakpoint
CREATE TABLE `files` (
	`id` int AUTO_INCREMENT NOT NULL,
	`filename_path` text NOT NULL,
	`mimetype` text NOT NULL,
	`signature` varchar(255) NOT NULL,
	CONSTRAINT `files_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `kabupaten` (
	`id` int AUTO_INCREMENT NOT NULL,
	`provinsi_id` int,
	`name` varchar(255),
	CONSTRAINT `kabupaten_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `kecamatan` (
	`id` int AUTO_INCREMENT NOT NULL,
	`kabupaten_id` int,
	`name` varchar(255),
	CONSTRAINT `kecamatan_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `kelurahan` (
	`id` int AUTO_INCREMENT NOT NULL,
	`kecamatan_id` int,
	`name` varchar(255),
	CONSTRAINT `kelurahan_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `kodepos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`kelurahan_id` int,
	`kodepos` varchar(5),
	CONSTRAINT `kodepos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pembayaran` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customer_id` int,
	`total` decimal(15,2),
	`status` varchar(255),
	`date` datetime,
	`method` varchar(255),
	`bukti_transfer_file_id` int,
	CONSTRAINT `pembayaran_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `provinsi` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255),
	CONSTRAINT `provinsi_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(255) NOT NULL,
	`password` varchar(512) NOT NULL,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`),
	CONSTRAINT `users_password_unique` UNIQUE(`password`)
);
--> statement-breakpoint
ALTER TABLE `customer` ADD CONSTRAINT `customer_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `customer` ADD CONSTRAINT `customer_kelurahan_id_kelurahan_id_fk` FOREIGN KEY (`kelurahan_id`) REFERENCES `kelurahan`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `customer` ADD CONSTRAINT `customer_kecamatan_id_kecamatan_id_fk` FOREIGN KEY (`kecamatan_id`) REFERENCES `kecamatan`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `customer` ADD CONSTRAINT `customer_kabupaten_id_kabupaten_id_fk` FOREIGN KEY (`kabupaten_id`) REFERENCES `kabupaten`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `customer` ADD CONSTRAINT `customer_provinsi_id_provinsi_id_fk` FOREIGN KEY (`provinsi_id`) REFERENCES `provinsi`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `customer` ADD CONSTRAINT `customer_kodepos_id_kodepos_id_fk` FOREIGN KEY (`kodepos_id`) REFERENCES `kodepos`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `kabupaten` ADD CONSTRAINT `kabupaten_provinsi_id_provinsi_id_fk` FOREIGN KEY (`provinsi_id`) REFERENCES `provinsi`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `kecamatan` ADD CONSTRAINT `kecamatan_kabupaten_id_kabupaten_id_fk` FOREIGN KEY (`kabupaten_id`) REFERENCES `kabupaten`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `kelurahan` ADD CONSTRAINT `kelurahan_kecamatan_id_kecamatan_id_fk` FOREIGN KEY (`kecamatan_id`) REFERENCES `kecamatan`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `kodepos` ADD CONSTRAINT `kodepos_kelurahan_id_kelurahan_id_fk` FOREIGN KEY (`kelurahan_id`) REFERENCES `kelurahan`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pembayaran` ADD CONSTRAINT `pembayaran_customer_id_customer_id_fk` FOREIGN KEY (`customer_id`) REFERENCES `customer`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pembayaran` ADD CONSTRAINT `pembayaran_bukti_transfer_file_id_files_id_fk` FOREIGN KEY (`bukti_transfer_file_id`) REFERENCES `files`(`id`) ON DELETE no action ON UPDATE no action;