-- Revolution Roleplay Database Schema
-- MySQL Database Setup

CREATE DATABASE IF NOT EXISTS revolution_rp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE revolution_rp;

-- Users table (Admin and Staff)
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'staff') DEFAULT 'staff',
    allowed_forms JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Application Forms table
CREATE TABLE application_forms (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    position VARCHAR(100) NOT NULL,
    fields JSON NOT NULL,
    webhook_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Application Submissions table
CREATE TABLE application_submissions (
    id VARCHAR(50) PRIMARY KEY,
    form_id VARCHAR(50) NOT NULL,
    applicant_name VARCHAR(255) NOT NULL,
    applicant_discord_id VARCHAR(100),
    responses JSON NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (form_id) REFERENCES application_forms(id) ON DELETE CASCADE
);

-- Changelogs table
CREATE TABLE changelogs (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    version VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default admin user
INSERT INTO users (id, username, password_hash, role, allowed_forms, created_by) VALUES 
('admin-001', 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', '[]', 'system');
-- Password is: admin123

-- Insert sample application forms
INSERT INTO application_forms (id, title, description, position, fields, webhook_url, is_active, created_by) VALUES 
('form-001', 'Staff Ansøgning', 'Ansøg som moderator på Revolution RP', 'Moderator', 
 '[{"id":"field-1","label":"Dit fulde navn","field_type":"text","required":true,"placeholder":"Indtast dit fulde navn"},{"id":"field-2","label":"Din alder","field_type":"text","required":true,"placeholder":"Hvor gammel er du?"},{"id":"field-3","label":"Hvorfor ønsker du at blive staff?","field_type":"textarea","required":true,"placeholder":"Beskriv dine motivationer..."}]', 
 '', TRUE, 'admin'),

('form-002', 'Staff Ansøgning Test', 'Test ansøgning for staff rolle', 'Staff', 
 '[{"id":"field-4","label":"Brugernavn","field_type":"text","required":true,"placeholder":"Dit Discord brugernavn"},{"id":"field-5","label":"Erfaring","field_type":"select","required":true,"options":["Ingen","Lidt","Meget","Ekspert"]}]', 
 '', TRUE, 'admin');

-- Insert sample submissions
INSERT INTO application_submissions (id, form_id, applicant_name, responses, status) VALUES 
('sub-001', 'form-001', 'Test Bruger', 
 '{"field-1":"Test Bruger Navn","field-2":"25","field-3":"Jeg ønsker at hjælpe communityet og har god erfaring med roleplay."}', 
 'pending'),

('sub-002', 'form-002', 'Anders Hansen', 
 '{"field-4":"Anders#1234","field-5":"Meget"}', 
 'approved');

-- Insert sample changelogs
INSERT INTO changelogs (id, title, content, version, created_by) VALUES 
('changelog-001', 'Server Launch', 'Velkommen til Revolution Roleplay!\n\n• Server er nu live og klar til spil\n• Alle grundlæggende systemer er implementeret\n• Staff team er på plads\n• Discord server er oprettet', '1.0.0', 'admin'),

('changelog-002', 'Performance Forbedringer', 'Mindre opdateringer og fejlrettelser:\n\n• Forbedret server performance\n• Rettet bugs i job systemet\n• Tilføjet nye køretøjer\n• Optimeret database queries', '1.0.1', 'admin'),

('changelog-003', 'Nye Features', 'Store opdateringer til serveren:\n\n• Nyt housing system\n• Forbedret economy\n• Nye jobs tilgængelige\n• Bank system opdateret\n• Bug fixes og stabilitet', '1.1.0', 'admin');

-- Create indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_forms_active ON application_forms(is_active);
CREATE INDEX idx_submissions_form_id ON application_submissions(form_id);
CREATE INDEX idx_submissions_status ON application_submissions(status);
CREATE INDEX idx_changelogs_created_at ON changelogs(created_at);