DROP DATABASE IF EXISTS employee_db;
CREATE DATABASE employee_db;

USE employee_db;

CREATE TABLE departments (
  id INT NOT NULL AUTO_INCREMENT,
  name varchar(30) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE roles (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title varchar(30) NOT NULL,
  salary decimal(10,2) NOT NULL,
  department_id INT NOT NULL,
  CONSTRAINT `department_id` FOREIGN KEY (department_id) REFERENCES departments (id) ON UPDATE CASCADE
);

CREATE TABLE employees (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  first_name varchar(30) NOT NULL,
  last_name varchar(30) NOT NULL,
  role_id int DEFAULT NULL,
  manager_id int DEFAULT NULL,
  CONSTRAINT `manager_id` FOREIGN KEY (manager_id) REFERENCES employees (id) ON UPDATE CASCADE,
  CONSTRAINT `role_id` FOREIGN KEY (role_id) REFERENCES roles (id) ON UPDATE CASCADE
); 