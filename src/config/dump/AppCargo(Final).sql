-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema cargoapp_db
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `cargoapp_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `cargoapp_db`;

-- -----------------------------------------------------
-- Table `tipo_usuario`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tipo_usuario` (
  `idTipo_Usuario` INT NOT NULL AUTO_INCREMENT,
  `descripcion` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`idTipo_Usuario`)
) ENGINE = InnoDB AUTO_INCREMENT = 4 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- -----------------------------------------------------
-- Table `usuario`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `usuario` (
  `idUsuario` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(45) NOT NULL,
  `correo` VARCHAR(100) NOT NULL,
  `contrasena` VARCHAR(255) NOT NULL,
  `telefono` VARCHAR(20) NULL DEFAULT NULL,
  `fecha_registro` DATE NULL DEFAULT (current_date),
  `estado` ENUM('Activo', 'Inactivo') NULL DEFAULT 'Activo',
  `idTipo_Usuario` INT NULL DEFAULT NULL,
  PRIMARY KEY (`idUsuario`),
  UNIQUE INDEX `correo` (`correo` ASC),
  INDEX `idTipo_Usuario` (`idTipo_Usuario` ASC),
  CONSTRAINT `usuario_ibfk_1`
    FOREIGN KEY (`idTipo_Usuario`)
    REFERENCES `tipo_usuario` (`idTipo_Usuario`)
) ENGINE = InnoDB AUTO_INCREMENT = 12 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- -----------------------------------------------------
-- Table `cliente`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cliente` (
  `idCliente` INT NOT NULL AUTO_INCREMENT,
  `idUsuario` INT NULL DEFAULT NULL,
  `empresa` VARCHAR(100) NULL DEFAULT NULL,
  `nit` VARCHAR(45) NULL DEFAULT NULL,
  PRIMARY KEY (`idCliente`),
  INDEX `idUsuario` (`idUsuario` ASC),
  CONSTRAINT `cliente_ibfk_1`
    FOREIGN KEY (`idUsuario`)
    REFERENCES `usuario` (`idUsuario`)
) ENGINE = InnoDB AUTO_INCREMENT = 3 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- -----------------------------------------------------
-- Table `solicitud_carga`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `solicitud_carga` (
  `idSolicitud_Carga` INT NOT NULL AUTO_INCREMENT,
  `descripcion` VARCHAR(100) NULL DEFAULT NULL,
  `peso` DECIMAL(10,2) NULL DEFAULT NULL,
  `origen` VARCHAR(100) NULL DEFAULT NULL,
  `destino` VARCHAR(100) NULL DEFAULT NULL,
  `fecha_publicacion` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `idUsuario` INT NOT NULL,
  `idTransportista` INT NULL DEFAULT NULL,
  `origen_lat` DECIMAL(10,6) NULL DEFAULT NULL,
  `origen_lng` DECIMAL(10,6) NULL DEFAULT NULL,
  `destino_lat` DECIMAL(10,6) NULL DEFAULT NULL,
  `destino_lng` DECIMAL(10,6) NULL DEFAULT NULL,
  `distancia_km` DECIMAL(10,2) NULL DEFAULT NULL,
  `estado_carga` ENUM('disponible','negociando','cerrado','cancelado') NULL DEFAULT 'disponible',
  PRIMARY KEY (`idSolicitud_Carga`),
  INDEX `fk_solicitud_usuario` (`idUsuario` ASC),
  CONSTRAINT `fk_solicitud_usuario`
    FOREIGN KEY (`idUsuario`)
    REFERENCES `usuario` (`idUsuario`)
) ENGINE = InnoDB AUTO_INCREMENT = 46 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- -----------------------------------------------------
-- Table `transportista`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `transportista` (
  `idTransportista` INT NOT NULL AUTO_INCREMENT,
  `idUsuario` INT NULL DEFAULT NULL,
  `placa` VARCHAR(10) NULL DEFAULT NULL,
  `vehiculo` VARCHAR(60) NULL DEFAULT NULL,
  `capacidad` INT NULL DEFAULT NULL,
  PRIMARY KEY (`idTransportista`),
  INDEX `idUsuario` (`idUsuario` ASC),
  CONSTRAINT `transportista_ibfk_1`
    FOREIGN KEY (`idUsuario`)
    REFERENCES `usuario` (`idUsuario`)
) ENGINE = InnoDB AUTO_INCREMENT = 5 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- -----------------------------------------------------
-- Table `contrato`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `contrato` (
  `idContrato` INT NOT NULL AUTO_INCREMENT,
  `idSolicitud_Carga` INT NULL DEFAULT NULL,
  `idCliente` INT NULL DEFAULT NULL,
  `idTransportista` INT NULL DEFAULT NULL,
  `fecha_inicio` DATETIME NULL DEFAULT NULL,
  `fecha_fin` DATETIME NULL DEFAULT NULL,
  `valor_final` DECIMAL(10,2) NULL DEFAULT NULL,
  `condiciones` TEXT NULL DEFAULT NULL,
  `estado_contrato` ENUM('Activo','Finalizado','Cancelado') NULL DEFAULT 'Activo',
  `hashBlockchain` VARCHAR(100) NULL DEFAULT NULL,
  PRIMARY KEY (`idContrato`),
  INDEX `idSolicitud_Carga` (`idSolicitud_Carga` ASC),
  INDEX `idCliente` (`idCliente` ASC),
  INDEX `idTransportista` (`idTransportista` ASC),
  CONSTRAINT `contrato_ibfk_1`
    FOREIGN KEY (`idSolicitud_Carga`)
    REFERENCES `solicitud_carga` (`idSolicitud_Carga`),
  CONSTRAINT `contrato_ibfk_2`
    FOREIGN KEY (`idCliente`)
    REFERENCES `cliente` (`idCliente`),
  CONSTRAINT `contrato_ibfk_3`
    FOREIGN KEY (`idTransportista`)
    REFERENCES `transportista` (`idTransportista`)
) ENGINE = InnoDB AUTO_INCREMENT = 8 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- -----------------------------------------------------
-- Table `negociacion`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `negociacion` (
  `idNegociacion` INT NOT NULL AUTO_INCREMENT,
  `idSolicitud_Carga` INT NULL DEFAULT NULL,
  `idCliente` INT NULL DEFAULT NULL,
  `idTransportista` INT NULL DEFAULT NULL,
  `monto` DECIMAL(10,2) NULL DEFAULT NULL,
  `estado` ENUM('Oferta_Cliente','Oferta_Transportista','Pactado','Cancelado') NULL DEFAULT 'Oferta_Transportista',
  `fecha_inicio` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idNegociacion`),
  INDEX `idSolicitud_Carga` (`idSolicitud_Carga` ASC),
  CONSTRAINT `negociacion_ibfk_1`
    FOREIGN KEY (`idSolicitud_Carga`)
    REFERENCES `solicitud_carga` (`idSolicitud_Carga`)
) ENGINE = InnoDB AUTO_INCREMENT = 48 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- -----------------------------------------------------
-- Table `oferta`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `oferta` (
  `idOferta` INT NOT NULL AUTO_INCREMENT,
  `idSolicitud_Carga` INT NULL DEFAULT NULL,
  `idTransportista` INT NULL DEFAULT NULL,
  `monto` DECIMAL(10,2) NULL DEFAULT NULL,
  `estado` ENUM('Pendiente','Aceptada','Rechazada','Contraoferta') NULL DEFAULT NULL,
  `fecha_oferta` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `comentarios` VARCHAR(255) NULL DEFAULT NULL,
  PRIMARY KEY (`idOferta`),
  INDEX `idSolicitud_Carga` (`idSolicitud_Carga` ASC),
  INDEX `idTransportista` (`idTransportista` ASC),
  CONSTRAINT `oferta_ibfk_1`
    FOREIGN KEY (`idSolicitud_Carga`)
    REFERENCES `solicitud_carga` (`idSolicitud_Carga`),
  CONSTRAINT `oferta_ibfk_2`
    FOREIGN KEY (`idTransportista`)
    REFERENCES `transportista` (`idTransportista`)
) ENGINE = InnoDB AUTO_INCREMENT = 19 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- -----------------------------------------------------
-- Table `precio_carga`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `precio_carga` (
  `idPrecio_Carga` INT NOT NULL AUTO_INCREMENT,
  `idSolicitud_Carga` INT NOT NULL,
  `precio_estimado` DECIMAL(10,2) NOT NULL,
  `precio_min` DECIMAL(10,2) NOT NULL,
  `precio_max` DECIMAL(10,2) NOT NULL,
  `precio_final` DECIMAL(10,2) NULL DEFAULT NULL,
  PRIMARY KEY (`idPrecio_Carga`),
  INDEX `idSolicitud_Carga` (`idSolicitud_Carga` ASC),
  CONSTRAINT `precio_carga_ibfk_1`
    FOREIGN KEY (`idSolicitud_Carga`)
    REFERENCES `solicitud_carga` (`idSolicitud_Carga`)
) ENGINE = InnoDB AUTO_INCREMENT = 30 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
