-- =========================================
-- DATABASE
-- =========================================
SHOW databases;
CREATE DATABASE IF NOT EXISTS barangay_finance
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE barangay_finance;

-- =========================================
-- USERS
-- =========================================
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('superadmin','admin','encoder','checker','reviewer','approver') NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  position VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  last_login DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================================
-- REVENUES
-- =========================================
CREATE TABLE revenues (
  id INT AUTO_INCREMENT PRIMARY KEY,
  source VARCHAR(150) NOT NULL,
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  reference_no VARCHAR(100),
  created_by INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_revenues_user
    FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB;

-- =========================================
-- EXPENSES
-- =========================================
CREATE TABLE expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  amount DECIMAL(12,2) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  payee VARCHAR(150),
  reference_no VARCHAR(100),
  created_by INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_expenses_user
    FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB;

-- =========================================
-- FUND OPERATIONS
-- =========================================
CREATE TABLE fund_operations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fund_type VARCHAR(100) NOT NULL,
  opening_balance DECIMAL(14,2) NOT NULL,
  receipts DECIMAL(14,2) DEFAULT 0,
  disbursements DECIMAL(14,2) DEFAULT 0,
  closing_balance DECIMAL(14,2) NOT NULL,
  period VARCHAR(50),
  date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================================
-- BUDGET ALLOCATIONS
-- =========================================
CREATE TABLE budget_allocations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  allocated_amount DECIMAL(14,2) NOT NULL,
  utilized_amount DECIMAL(14,2) DEFAULT 0,
  year INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================================
-- BUDGET ENTRIES
-- =========================================
CREATE TABLE budget_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  transaction_id VARCHAR(50) NOT NULL UNIQUE,
  transaction_date DATE NOT NULL,
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  amount DECIMAL(12,2) NOT NULL,
  payee VARCHAR(150),
  expenditure_program VARCHAR(150),
  program_description TEXT,
  allocation_id INT,
  created_by INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_budget_entries_user
    FOREIGN KEY (created_by) REFERENCES users(id),

  CONSTRAINT fk_budget_entries_allocation
    FOREIGN KEY (allocation_id) REFERENCES budget_allocations(id)
) ENGINE=InnoDB;

-- =========================================
-- COLLECTIONS (INCOME WITH REVIEW)
-- =========================================
CREATE TABLE collections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  transaction_id VARCHAR(50) NOT NULL UNIQUE,
  transaction_date DATE NOT NULL,
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  payor VARCHAR(150),
  nature_of_collection VARCHAR(150),
  review_status ENUM('pending','approved','rejected') DEFAULT 'pending',
  review_comment TEXT,
  reviewed_by INT,
  created_by INT,
  reviewed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_collections_reviewer
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
) ENGINE=InnoDB;
ALTER TABLE collections
ADD COLUMN description TEXT AFTER nature_of_collection,
ADD COLUMN fund_source VARCHAR(150) AFTER description,
ADD COLUMN or_number VARCHAR(100) AFTER fund_source,
ADD COLUMN remarks TEXT AFTER or_number;

-- =========================================
-- DISBURSEMENTS (EXPENSE WITH REVIEW)
-- =========================================
CREATE TABLE disbursements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  transaction_id VARCHAR(50) NOT NULL UNIQUE,
  transaction_date DATE NOT NULL,
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  amount DECIMAL(12,2) NOT NULL,
  payee VARCHAR(150),
  nature_of_disbursement VARCHAR(150),
  review_status ENUM('pending','approved','rejected') DEFAULT 'pending',
  review_comment TEXT,
  reviewed_by INT,
  reviewed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_disbursements_reviewer
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
) ENGINE=InnoDB;
ALTER TABLE disbursements
ADD COLUMN description TEXT AFTER nature_of_disbursement,
ADD COLUMN fund_source VARCHAR(150) AFTER description,
ADD COLUMN or_number VARCHAR(100) AFTER fund_source,
ADD COLUMN remarks TEXT AFTER or_number;
-- =========================================
-- DFUR PROJECTS
-- =========================================
CREATE TABLE dfur_projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  transaction_id VARCHAR(50) NOT NULL UNIQUE,
  transaction_date DATE NOT NULL,
  project VARCHAR(200) NOT NULL,
  location VARCHAR(150),
  total_cost_approved DECIMAL(14,2) NOT NULL,
  status ENUM('pending','approved','rejected','completed') DEFAULT 'pending',
  review_comment TEXT,
  reviewed_by INT,
  reviewed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_dfur_reviewer
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
) ENGINE=InnoDB;

-- =========================================
-- VIEWER COMMENTS
-- =========================================
CREATE TABLE viewer_comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  comment TEXT NOT NULL,
  status ENUM('pending','approved','rejected') DEFAULT 'pending',
  reviewed_by INT,
  reviewed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_viewer_comments_reviewer
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
) ENGINE=InnoDB;

ALTER TABLE collections
ADD created_by INT NOT NULL,
ADD CONSTRAINT fk_collections_creator
  FOREIGN KEY (created_by) REFERENCES users(id);

ALTER TABLE disbursements
ADD created_by INT NOT NULL,
ADD CONSTRAINT fk_disbursements_creator
  FOREIGN KEY (created_by) REFERENCES users(id);

ALTER TABLE disbursements
ADD allocation_id INT;

ALTER TABLE disbursements
ADD CONSTRAINT fk_disbursements_allocation
FOREIGN KEY (allocation_id)
REFERENCES budget_allocations(id);
 

SELECT * FROM users;
SELECT * FROM budget_entries;
SELECT * FROM collections;
SELECT * FROM disbursements;
SELECT * FROM dfur_projects;
SELECT * FROM viewer_comments;

ALTER table viewer_comments
ADD COLUMN name varchar(255) after comment,
ADD COLUMN email varchar(255) after name;

ALTER TABLE budget_entries
ADD COLUMN is_flagged BOOLEAN default 0 after review_status;

ALTER TABLE dfur_projects
RENAME COLUMN reamarks TO remarks;

ALTER TABLE dfur_projects
ADD name_of_collection VARCHAR(100) AFTER transaction_date,
ADD total_cost_incurred DECIMAL(14,2) AFTER total_cost_approved,
ADD date_started DATE AFTER total_cost_incurred,
ADD target_completion_date DATE AFTER date_started,
ADD stats ENUM('planned','in_progress','complete','on_hold', 'cancelled') DEFAULT 'planned' AFTER target_completion_date,
ADD no_extensions INT AFTER stats,
ADD reamarks VARCHAR(200) AFTER no_extensions;

ALTER TABLE collections
ADD is_active BOOL default 1 after is_flagged;

SELECT COUNT(*) FROM collections
WHERE transaction_date BETWEEN '2026-01-20' AND '2026-01-29';

SELECT * FROM collections
    WHERE transaction_date >= '2026-01-20'
    AND transaction_date < DATE_ADD('2026-01-29', INTERVAL 1 DAY);

INSERT INTO users 
(username, password, role, full_name, position, is_active)
VALUES
('superadmin', 'admin123', 'superadmin', 'System Administrator', 'Super Admin', 1),
('kapitan', 'kapitan123', 'admin', 'Barangay Captain', 'Kapitan', 1),
('secretary', 'secretary123', 'admin', 'Barangay Secretary', 'Secretary', 1),
('treasurer', 'treasurer123', 'encoder', 'Barangay Treasurer', 'Treasurer', 1),
('bookkeeper', 'bookkeeper123', 'checker', 'Barangay Bookkeeper', 'Bookkeeper', 1),
('council1', 'council123', 'reviewer', 'Barangay Councilor 1', 'Barangay Council', 1),
('approver', 'approver123', 'approver', 'Budget Approver', 'Kapitan', 1);

DELETE FROM users
where id > 0;
ALTER TABLE users AUTO_INCREMENT = 1;

UPDATE users SET is_active = 1 WHERE id = 3;
UPDATE users SET is_active = 1 WHERE id = 4;
UPDATE users SET is_active = 1 WHERE id = 5;
UPDATE users SET is_active = 1 WHERE id = 6;

show tables;

ALTER TABLE budget_entries
ADD fund_source VARCHAR(100) AFTER amount,
ADD dv_number VARCHAR(50) AFTER payee,
ADD remarks TEXT AFTER program_description;

INSERT INTO budget_allocations (category, allocated_amount, utilized_amount, year)
VALUES
('A. Personal Services', 1200000.00, 0.00, 2026),
('B. Maintenance and Other Operating Expenses (MOOE)', 800000.00, 0.00, 2026),
('C. Capital Outlay', 500000.00, 0.00, 2026),
('D. Special Purpose Appropriations (SPA)', 300000.00, 0.00, 2026),
('E. Basic Services - Social Services', 400000.00, 0.00, 2026),
('F. Infrastructure Projects - 20% Development Fund', 1000000.00, 0.00, 2026),
('G. Other Services', 200000.00, 0.00, 2026);


