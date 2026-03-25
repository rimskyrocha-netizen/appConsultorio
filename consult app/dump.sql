-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: odontologia
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
-- Table structure for table `patients`
--

DROP TABLE IF EXISTS `patients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `patients` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `cpf` varchar(20) DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `whatsapp` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `last_visit` datetime DEFAULT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `medical_history` text DEFAULT NULL,
  `insurance_name` varchar(255) DEFAULT NULL,
  `insurance_card` varchar(50) DEFAULT NULL,
  `observations` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patients`
--

LOCK TABLES `patients` WRITE;
/*!40000 ALTER TABLE `patients` DISABLE KEYS */;
INSERT INTO `patients` VALUES ('0a000f87-79ab-4746-974f-450eec8501fe','Divani Conceição Silva',NULL,NULL,'11 98275-9953','','','2026-03-18 20:55:55','[\"Novo\"]',NULL,'','',''),('32f555fd-40c9-4555-a83b-f7d05f2cf5d6','Úria Maria de Holanda Gomes','00844472492',NULL,'82993274074','','','2026-03-18 20:45:57','[\"Novo\"]',NULL,'','',''),('4236edca-bdc7-4381-9bd6-62f88419b1f8','José Roberto Nunes dos Santos',NULL,NULL,'82999216756','','','2026-03-18 20:37:29','[\"Novo\"]',NULL,'','','26/02/2026 - moldagem alginato para provisório superior PPR removível + provisório fixo 22 + medicação para prevenção disseminação'),('5484f1b6-a309-4bf9-8a50-f7d1d4e11338','Narene da Silva Moraes',NULL,NULL,'82996453653','','','2026-03-18 20:34:50','[\"Novo\"]',NULL,'petrobrás','010186307306',''),('5be360ec-1628-4101-b28e-d2287268aeaf','Daniel Santos',NULL,NULL,'81 24051370','','','2026-03-18 20:40:18','[\"Novo\"]',NULL,'','','prótese protocolo fraturada na região de 26'),('650d3d37-f72f-496c-92c0-d63a6af4b5d3','Maria do Carmo do Livramento',NULL,NULL,'82988515021','','','2026-03-18 21:03:29','[\"Novo\"]',NULL,'','',''),('71780f66-1ef2-482f-b52d-ee09aea737c8','Laura Leandra Costa',NULL,NULL,'999271160','','','2026-03-20 11:44:12','[\"Novo\"]',NULL,'petrobrás','010967277303',''),('9990dcf9-bcbd-487e-b054-57dd6c7c9c14','Maria Aparecida Brasileiro Padilha',NULL,NULL,'8298885-2991','','','2026-03-18 21:13:28','[\"Novo\"]',NULL,'petrobrás','010184397704',''),('9a0bf945-332c-4850-ac60-6659e536efa1','Lucas Pereira Martins',NULL,NULL,'82999132965','','','2026-03-18 21:05:56','[\"Novo\"]',NULL,'particular','',''),('a4e47f0e-146a-47f1-8e97-9fbc45041cbc','Maria Luiza de C Acosta',NULL,NULL,'81-992826820','','','2026-03-18 20:50:26','[\"Novo\"]',NULL,'petrobrás','010572492001','paciente de outro estado (Pernambuco)'),('ae908a47-12be-4fa6-9051-21a8828ddda5','Terezinha Maria Correia dos Santos',NULL,NULL,'82 9913-8798','','','2026-03-18 20:43:17','[\"Novo\"]',NULL,'petrobrás','700403402395844',''),('b26b7550-d703-40dc-9fb9-4240b738515e','Ricardo Senf',NULL,NULL,'82 9982-7080','','','2026-03-18 21:16:24','[\"Novo\"]',NULL,'','',''),('b65d25d8-6a1f-420b-b651-781f7c464fb3','Emilly Cristine Oliveira',NULL,NULL,'82991744242','82991960305','','2026-03-18 20:30:08','[\"Novo\"]',NULL,'','','Paciente com DTM usando placa miorrelaxante'),('d9bfbc67-9e6d-4d22-bcd3-9324775acedc','GENSEL BUZZATTI SCHARLAU',NULL,NULL,'82 9969-6412','','','2026-03-18 21:15:14','[\"Novo\"]',NULL,'petrobrás','010532424100 ',''),('fe47d4df-71c7-45e0-90fe-9d33810b1016','Licia Melo de Andrade',NULL,NULL,'82988291755','','','2026-03-18 21:07:13','[\"Novo\"]',NULL,'particular','','');
/*!40000 ALTER TABLE `patients` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-24 19:24:27
