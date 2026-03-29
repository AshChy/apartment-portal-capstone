## Database Overview

This SQLite database supports the apartment portal system by managing users, applications, leases, and payments. It includes sample data to show how an applicant moves through approval, lease creation, and payment tracking.

### Requirements

Install DB Browser for SQLite:  
https://sqlitebrowser.org/dl/


### How to Open the Database

1. Download the `apartment_portal.db` file from this repository  
2. Open DB Browser for SQLite  
3. Click "Open Database"  
4. Select the downloaded `.db` file  


### Viewing Data

Go to the "Browse Data" tab to view the following tables:

- User  
- Application  
- Lease  
- Payment  


### Running Queries (Dashboard View)

1. Navigate to the "Execute SQL" tab  
2. Run the following query:

```sql
SELECT u.name, a.status, l.leaseStatus, p.amount
FROM User u
JOIN Application a ON u.userId = a.userId
JOIN Lease l ON a.applicationId = l.applicationId
JOIN Payment p ON l.leaseId = p.leaseId;
```
This query shows:

Applicant status (Pending or Approved)
Lease status
Payment information
