-- MySQL dump 10.13  Distrib 5.7.24, for Linux (x86_64)
--
-- Host: localhost    Database: stylish
-- ------------------------------------------------------
-- Server version	5.7.24

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `campaign`
--

DROP TABLE IF EXISTS `campaign`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `campaign` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint(20) unsigned NOT NULL,
  `picture` varchar(255) NOT NULL,
  `story` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `product` (`product_id`),
  CONSTRAINT `campaign_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `campaign`
--

LOCK TABLES `campaign` WRITE;
/*!40000 ALTER TABLE `campaign` DISABLE KEYS */;
INSERT INTO `campaign` VALUES (1,201807242228,'/assets/keyvisuals/201807242228.jpg','於是\r\n我也想要給你\r\n一個那麼美好的自己。\r\n不朽《與自己和好如初》'),(2,201807242222,'/assets/keyvisuals/201807242222.jpg','永遠\r\n展現自信與專業\r\n無法抵擋的男人魅力。\r\n復古《再一次經典》'),(3,201807202140,'/assets/keyvisuals/201807202140.jpg','瞬間\r\n在城市的角落\r\n找到失落多時的記憶。\r\n印象《都會故事集》');
/*!40000 ALTER TABLE `campaign` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hot`
--

DROP TABLE IF EXISTS `hot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hot` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hot`
--

LOCK TABLES `hot` WRITE;
/*!40000 ALTER TABLE `hot` DISABLE KEYS */;
INSERT INTO `hot` VALUES (1,'冬季新品搶先看'),(2,'百搭穿搭必敗品');
/*!40000 ALTER TABLE `hot` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hot_product`
--

DROP TABLE IF EXISTS `hot_product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hot_product` (
  `hot_id` bigint(20) unsigned NOT NULL,
  `product_id` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`hot_id`,`product_id`),
  KEY `product` (`product_id`),
  CONSTRAINT `hot_product_ibfk_1` FOREIGN KEY (`hot_id`) REFERENCES `hot` (`id`),
  CONSTRAINT `hot_product_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hot_product`
--

LOCK TABLES `hot_product` WRITE;
/*!40000 ALTER TABLE `hot_product` DISABLE KEYS */;
INSERT INTO `hot_product` VALUES (2,201807202140),(1,201807202157),(2,201807242211),(1,201807242216),(2,201807242228),(1,201807242232);
/*!40000 ALTER TABLE `hot_product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product`
--

DROP TABLE IF EXISTS `product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `product` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `category` varchar(127) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `price` int(10) unsigned NOT NULL,
  `texture` varchar(127) NOT NULL,
  `wash` varchar(127) NOT NULL,
  `place` varchar(127) NOT NULL,
  `note` varchar(127) NOT NULL,
  `story` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=201807242235 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product`
--

LOCK TABLES `product` WRITE;
/*!40000 ALTER TABLE `product` DISABLE KEYS */;
INSERT INTO `product` VALUES (201807201824,'girls','前開衩扭結洋裝','厚薄：薄\r\n彈性：無',799,'棉 100%','手洗，溫水','中國','實品顏色依單品照為主','O.N.S is all about options, which is why we took our staple polo shirt and upgraded it with slubby linen jersey, making it even lighter for those who prefer their summer style extra-breezy.'),(201807202140,'girls','透肌澎澎防曬襯衫','厚薄：薄\r\n彈性：無',599,'棉 100%','手洗，溫水','中國','實品顏色依單品照為主','O.N.S is all about options, which is why we took our staple polo shirt and upgraded it with slubby linen jersey, making it even lighter for those who prefer their summer style extra-breezy.'),(201807202150,'girls','小扇紋細織上衣','厚薄：薄\r\n彈性：無',599,'棉 100%','手洗，溫水','中國','實品顏色依單品照為主','O.N.S is all about options, which is why we took our staple polo shirt and upgraded it with slubby linen jersey, making it even lighter for those who prefer their summer style extra-breezy.'),(201807202157,'girls','活力花紋長筒牛仔褲','厚薄：薄\r\n彈性：無',1299,'棉 100%','手洗，溫水','中國','實品顏色依單品照為主','O.N.S is all about options, which is why we took our staple polo shirt and upgraded it with slubby linen jersey, making it even lighter for those who prefer their summer style extra-breezy.'),(201807242211,'boys','純色輕薄百搭襯衫','厚薄：薄\r\n彈性：無',799,'棉 100%','手洗，溫水','中國','實品顏色依單品照為主','O.N.S is all about options, which is why we took our staple polo shirt and upgraded it with slubby linen jersey, making it even lighter for those who prefer their summer style extra-breezy.'),(201807242216,'boys','時尚輕鬆休閒西裝','厚薄：薄\r\n彈性：無',2399,'棉 100%','手洗，溫水','中國','實品顏色依單品照為主','O.N.S is all about options, which is why we took our staple polo shirt and upgraded it with slubby linen jersey, making it even lighter for those who prefer their summer style extra-breezy.'),(201807242222,'boys','經典商務西裝','厚薄：薄\r\n彈性：無',3999,'棉 100%','手洗，溫水','中國','實品顏色依單品照為主','O.N.S is all about options, which is why we took our staple polo shirt and upgraded it with slubby linen jersey, making it even lighter for those who prefer their summer style extra-breezy.'),(201807242228,'accessories','夏日海灘戶外遮陽帽','厚薄：薄\r\n彈性：無',1499,'棉 100%','手洗，溫水','中國','實品顏色依單品照為主','O.N.S is all about options, which is why we took our staple polo shirt and upgraded it with slubby linen jersey, making it even lighter for those who prefer their summer style extra-breezy.'),(201807242230,'accessories','經典牛仔帽','厚薄：薄\r\n彈性：無',799,'棉 100%','手洗，溫水','中國','實品顏色依單品照為主','O.N.S is all about options, which is why we took our staple polo shirt and upgraded it with slubby linen jersey, making it even lighter for those who prefer their summer style extra-breezy.'),(201807242232,'accessories','卡哇伊多功能隨身包','厚薄：薄\r\n彈性：無',1299,'棉 100%','手洗，溫水','中國','實品顏色依單品照為主','O.N.S is all about options, which is why we took our staple polo shirt and upgraded it with slubby linen jersey, making it even lighter for those who prefer their summer style extra-breezy.'),(201807242234,'accessories','柔軟氣質羊毛圍巾','厚薄：薄\r\n彈性：無',1799,'棉 100%','手洗，溫水','中國','實品顏色依單品照為主','O.N.S is all about options, which is why we took our staple polo shirt and upgraded it with slubby linen jersey, making it even lighter for those who prefer their summer style extra-breezy.');
/*!40000 ALTER TABLE `product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `variant`
--

DROP TABLE IF EXISTS `variant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `variant` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `color_code` varchar(15) NOT NULL,
  `color_name` varchar(15) NOT NULL,
  `size` varchar(15) NOT NULL,
  `stock` int(10) unsigned NOT NULL,
  `product_id` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `product` (`product_id`),
  CONSTRAINT `variant_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=85 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `variant`
--

LOCK TABLES `variant` WRITE;
/*!40000 ALTER TABLE `variant` DISABLE KEYS */;
INSERT INTO `variant` VALUES (27,'FFFFFF','白色','S',2,201807201824),(28,'FFFFFF','白色','M',1,201807201824),(29,'FFFFFF','白色','L',2,201807201824),(30,'DDFFBB','亮綠','S',9,201807201824),(31,'DDFFBB','亮綠','M',1,201807201824),(32,'DDFFBB','亮綠','L',5,201807201824),(33,'CCCCCC','淺灰','S',8,201807201824),(34,'CCCCCC','淺灰','M',5,201807201824),(35,'CCCCCC','淺灰','L',9,201807201824),(36,'DDFFBB','亮綠','S',7,201807202140),(37,'DDFFBB','亮綠','M',5,201807202140),(38,'DDFFBB','亮綠','L',8,201807202140),(39,'CCCCCC','淺灰','S',1,201807202140),(40,'CCCCCC','淺灰','M',6,201807202140),(41,'CCCCCC','淺灰','L',2,201807202140),(42,'DDFFBB','亮綠','S',3,201807202150),(43,'DDFFBB','亮綠','M',5,201807202150),(44,'CCCCCC','淺灰','S',4,201807202150),(45,'CCCCCC','淺灰','M',1,201807202150),(46,'BB7744','淺棕','S',2,201807202150),(47,'BB7744','淺棕','M',6,201807202150),(48,'DDF0FF','淺藍','S',8,201807202157),(49,'DDF0FF','淺藍','M',5,201807202157),(50,'DDF0FF','淺藍','L',6,201807202157),(51,'CCCCCC','淺灰','S',0,201807202157),(52,'CCCCCC','淺灰','M',6,201807202157),(53,'CCCCCC','淺灰','L',5,201807202157),(54,'334455','深藍','S',2,201807202157),(55,'334455','深藍','M',7,201807202157),(56,'334455','深藍','L',9,201807202157),(57,'FFFFFF','白色','M',5,201807242211),(58,'FFFFFF','白色','L',7,201807242211),(59,'FFFFFF','白色','XL',1,201807242211),(60,'DDF0FF','淺藍','M',1,201807242211),(61,'DDF0FF','淺藍','L',4,201807242211),(62,'DDF0FF','淺藍','XL',3,201807242211),(63,'FFFFFF','白色','S',10,201807242216),(64,'FFFFFF','白色','M',5,201807242216),(65,'FFFFFF','白色','L',6,201807242216),(66,'CCCCCC','淺灰','S',1,201807242216),(67,'CCCCCC','淺灰','M',3,201807242216),(68,'CCCCCC','淺灰','L',10,201807242216),(69,'334455','深藍','S',9,201807242222),(70,'334455','深藍','M',5,201807242222),(71,'334455','深藍','L',1,201807242222),(72,'334455','深藍','XL',9,201807242222),(73,'DDF0FF','淺藍','M',7,201807242228),(74,'DDF0FF','淺藍','L',1,201807242228),(75,'BB7744','淺棕','M',3,201807242228),(76,'BB7744','淺棕','L',1,201807242228),(77,'BB7744','淺棕','M',5,201807242230),(78,'BB7744','淺棕','L',1,201807242230),(79,'334455','深藍','M',5,201807242230),(80,'334455','深藍','L',2,201807242230),(81,'FFFFFF','白色','F',1,201807242232),(82,'FFDDDD','粉紅','F',1,201807242232),(83,'FFFFFF','白色','F',4,201807242234),(84,'DDF0FF','淺藍','F',7,201807242234);
/*!40000 ALTER TABLE `variant` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2019-02-07 20:06:42
