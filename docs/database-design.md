# Database Design

## Updated Schema 

The database schema has been aligned with the UML diagram and project plan submitted in week 2. The design centers around the application workflow:

- Users submit applications for apartment units
- Applications store related documents through a one-to-many relationship with the document table
- Approved applications trigger lease creation, linking application records to lease data for ongoing management
- Leases are associated with payments
- Maintenance requests are linked to both users and apartment units
- Announcements are created by users

This structure supports data validation, minimizes redundancy, and ensures consistent relationships across the system. 

Relationships are enforced through key identifiers (e.g., userId, applicationId, unitId), allowing efficient joins and data consistency across tables.

