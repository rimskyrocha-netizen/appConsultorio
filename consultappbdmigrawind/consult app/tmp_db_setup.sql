CREATE DATABASE IF NOT EXISTS odontologia;
CREATE USER IF NOT EXISTS 'odontologia'@'localhost' IDENTIFIED BY '561222';
GRANT ALL PRIVILEGES ON odontologia.* TO 'odontologia'@'localhost';
FLUSH PRIVILEGES;
