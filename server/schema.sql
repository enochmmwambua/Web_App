-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: gymbuddy_db
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `membership_tier` varchar(50) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Enoch Mutai Mwambua','mwambua.enoch@gmail.com','0798674807','Student','12345678','2026-09-08 20:18:08'),(2,'Neidoh','Neidoh@gmail.com','0799999999','standard','12345678','2026-09-09 05:52:23'),(3,'John Otieno','john.otieno@example.com',NULL,'Monthly Standard','SecurePassword123!','2026-09-22 23:27:44'),(4,'John Otieno','john@example.com','0700123456','standard','SecurePass123!','2026-09-22 23:32:04'),(7,'Johno Otieno','johno@example.com','0701123456','standard','SecurePass1234!','2026-09-22 23:42:48'),(8,'Enoch Mwambua','enoch.test2@example.com',NULL,'Monthly Standard','SecurePassword123!','2026-11-10 08:45:39'),(10,'Audit Test User','audit.1794302692922@example.com',NULL,'Monthly Standard','Password123!','2026-11-10 09:24:53'),(11,'Audit Test User','audit.1794302769258@example.com',NULL,'Monthly Standard','Password123!','2026-11-10 09:26:09'),(12,'Audit Test User','audit.1794315577313@example.com',NULL,'Monthly Standard','Password123!','2026-11-10 12:59:37'),(13,'Demo Tenant 2','demo.tenant22026@example.com',NULL,'Monthly Standard','SecurePassword1234!','2026-11-11 05:29:27'),(14,'Audit Test User','audit.1794377254617@example.com',NULL,'Monthly Standard','Password123!','2026-11-11 06:07:34'),(15,'Demo Tenant 3','demo.tenant32026@example.com',NULL,'Monthly Standard','SecurePassword12345!','2026-11-11 06:44:54'),(16,'Audit Test User','audit.1794379818606@example.com',NULL,'Monthly Standard','Password123!','2026-11-11 06:50:18');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workouts`
--

DROP TABLE IF EXISTS `workouts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `workouts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `day` varchar(20) NOT NULL,
  `exercise` varchar(255) NOT NULL,
  `is_completed` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workouts`
--

LOCK TABLES `workouts` WRITE;
/*!40000 ALTER TABLE `workouts` DISABLE KEYS */;
INSERT INTO `workouts` VALUES (1,'Monday','Seated Machine Chest Press',0),(2,'Monday','Incline DB Press',0),(3,'Monday','Tricep Pushdowns',0),(4,'Tuesday','Deadlift (Target: 160kg)',0),(5,'Tuesday','Lat Pulldowns',0),(6,'Tuesday','Bicep Curls',0),(7,'Wednesday','Rest',0),(8,'Thursday','Squats',0),(9,'Thursday','Leg Press',0),(10,'Thursday','Shoulder Press',0),(11,'Friday','Strict Pull-ups',0),(12,'Friday','Barbell Rows',0),(13,'Friday','Face Pulls',0),(14,'Saturday','Cardio / Core',0),(15,'Sunday','Rest',0),(18,'Monday','Bench Press 4x8',0),(19,'Monday','Bench Press 4x8',0),(20,'Monday','pushups',0);
/*!40000 ALTER TABLE `workouts` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-17 11:06:07
