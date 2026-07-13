# Contact Reconciliation API

Identity reconciliation service built for the BiteSpeed Backend Task.

This service links multiple contacts belonging to the same user based on shared email or phone number.

---

## => Hosted API

**Base URL:** https://contact-reconciliation-api.onrender.com

**Endpoint:** POST /lets

**Full Request URL:** POST https://contact-reconciliation-api.onrender.com/lets

---

## => Endpoint Usage

### --> Request

Send a JSON body (not form-data).

At least one of `email` or `phoneNumber` must be provided.

Example:

```json
{
  "email": "doc@future.com",
  "phoneNumber": "123456"
}
````

You may send:

* Only email
* Only phoneNumber
* Both

---

### --> Response Format

```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["doc@future.com"],
    "phoneNumbers": ["123456"],
    "secondaryContactIds": []
  }
}
```

---

## => How It Works

* If no matching contact exists → creates a new primary contact.
* If matching contact exists → links records together.
* If two primary contacts get connected → the oldest remains primary.
* All secondary contacts are consolidated under a single primary identity.

---

## !!! Important

* Request body must be JSON.
* Content-Type must be `application/json`.
* Do not use form-data.

---

## => Tech Stack

* Node.js
* TypeScript
* Express
* PostgreSQL (Supabase)
* Prisma ORM
* Hosted on Render