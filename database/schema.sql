PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS Payment;
DROP TABLE IF EXISTS Announcement;
DROP TABLE IF EXISTS MaintenanceRequest;
DROP TABLE IF EXISTS Lease;
DROP TABLE IF EXISTS Document;
DROP TABLE IF EXISTS Application;
DROP TABLE IF EXISTS ApartmentUnit;
DROP TABLE IF EXISTS User;

CREATE TABLE User (
    userId INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL
);

CREATE TABLE ApartmentUnit (
    unitId INTEGER PRIMARY KEY AUTOINCREMENT,
    unitNumber TEXT NOT NULL UNIQUE,
    bedrooms INTEGER NOT NULL,
    rentAmount REAL NOT NULL,
    availabilityStatus TEXT NOT NULL
);

CREATE TABLE Application (
    applicationId INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    unitId INTEGER NOT NULL,
    submissionDate TEXT NOT NULL,
    status TEXT NOT NULL,
    moveInDate TEXT,
    income REAL NOT NULL,
    FOREIGN KEY (userId) REFERENCES User(userId),
    FOREIGN KEY (unitId) REFERENCES ApartmentUnit(unitId)
);

CREATE TABLE Document (
    documentId INTEGER PRIMARY KEY AUTOINCREMENT,
    fileName TEXT NOT NULL,
    documentType TEXT NOT NULL,
    uploadDate TEXT NOT NULL,
    applicationId INTEGER NOT NULL,
    FOREIGN KEY (applicationId) REFERENCES Application(applicationId)
);

CREATE TABLE Lease (
    leaseId INTEGER PRIMARY KEY AUTOINCREMENT,
    applicationId INTEGER NOT NULL UNIQUE,
    tenantUserId INTEGER NOT NULL,
    unitId INTEGER NOT NULL,
    startDate TEXT NOT NULL,
    endDate TEXT NOT NULL,
    monthlyRent REAL NOT NULL,
    leaseStatus TEXT NOT NULL,
    FOREIGN KEY (applicationId) REFERENCES Application(applicationId),
    FOREIGN KEY (tenantUserId) REFERENCES User(userId),
    FOREIGN KEY (unitId) REFERENCES ApartmentUnit(unitId)
);

CREATE TABLE MaintenanceRequest (
    requestId INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    requestDate TEXT NOT NULL,
    status TEXT NOT NULL,
    userId INTEGER NOT NULL,
    unitId INTEGER NOT NULL,
    FOREIGN KEY (userId) REFERENCES User(userId),
    FOREIGN KEY (unitId) REFERENCES ApartmentUnit(unitId)
);

CREATE TABLE Announcement (
    announcementId INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    postDate TEXT NOT NULL,
    userId INTEGER NOT NULL,
    FOREIGN KEY (userId) REFERENCES User(userId)
);

CREATE TABLE Payment (
    paymentId INTEGER PRIMARY KEY AUTOINCREMENT,
    amount REAL NOT NULL,
    paymentDate TEXT,
    paymentStatus TEXT NOT NULL,
    leaseId INTEGER NOT NULL,
    FOREIGN KEY (leaseId) REFERENCES Lease(leaseId)
);

