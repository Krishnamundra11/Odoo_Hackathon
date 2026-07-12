# Odoo_Hackathon

# AssetFlow

An Enterprise Asset & Resource Management System that helps organizations manage physical assets and shared resources through a centralized ERP platform.

---

## Problem Statement

Organizations often rely on spreadsheets and manual records to track assets, allocate resources, schedule maintenance, and manage shared facilities. This leads to conflicts, poor visibility, and inefficient operations.

AssetFlow digitizes these processes by providing a centralized platform for asset lifecycle management, resource booking, maintenance workflows, audits, and operational reporting.

---

## Objective

Build a responsive ERP application that enables organizations to:

- Manage departments, asset categories, and employees
- Register and track assets throughout their lifecycle
- Allocate and transfer assets
- Book shared resources without scheduling conflicts
- Manage maintenance approval workflows
- Conduct structured asset audits
- View operational insights through dashboards and reports

---

## User Roles

### Admin
- Manage departments
- Manage asset categories
- Manage employee roles
- View organization-wide analytics

### Asset Manager
- Register assets
- Allocate and transfer assets
- Approve maintenance requests
- Approve asset returns

### Department Head
- View department assets
- Approve allocation/transfer requests
- Book shared resources

### Employee
- View assigned assets
- Book resources
- Raise maintenance requests
- Request returns/transfers

---

## Core Modules

### Authentication
- Login
- Signup
- Forgot Password
- Role-Based Access Control

### Organization Setup
- Department Management
- Asset Category Management
- Employee Directory

### Asset Management
- Asset Registration
- Asset Directory
- Asset Lifecycle Tracking
- Asset History

### Asset Allocation
- Allocate Assets
- Transfer Requests
- Return Assets
- Conflict Validation

### Resource Booking
- Book Shared Resources
- Calendar View
- Overlap Validation
- Booking Management

### Maintenance
- Raise Requests
- Approval Workflow
- Technician Assignment
- Resolution Tracking

### Asset Audit
- Audit Cycle Management
- Asset Verification
- Discrepancy Reports

### Reports & Analytics
- Asset Utilization
- Maintenance Statistics
- Department Summary
- Resource Usage

### Notifications & Activity Logs
- Assignment Notifications
- Booking Notifications
- Maintenance Updates
- Transfer Updates
- Audit Logs

---

## Asset Lifecycle

- Available
- Allocated
- Reserved
- Under Maintenance
- Lost
- Retired
- Disposed

---

## Key Business Rules

- An asset cannot be allocated to multiple users simultaneously.
- Resource bookings cannot overlap.
- Maintenance requests require approval before work begins.
- Asset status updates automatically based on workflow.
- Audit cycles generate discrepancy reports.
- Overdue allocations are flagged.
- Role-based permissions are enforced.

---

## Features

- Responsive user interface
- Role-based authentication
- Asset lifecycle management
- Resource booking
- Maintenance workflow
- Audit management
- Dashboard with KPIs
- Reports & Analytics
- Notifications
- Activity Logs

---

## Technology Stack

- Frontend
- Backend
- Database
- REST APIs

---

## Evaluation Focus

- Coding Standards
- Business Logic
- Modularity
- Database Design
- Security
- Performance
- Scalability
- Usability
- Debugging
- Responsive UI
