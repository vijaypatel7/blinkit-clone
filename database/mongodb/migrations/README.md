# Migrations

Ordered, idempotent migration scripts. Run in sequence:

```bash
MONGODB_URI=mongodb://localhost:27017/blinkit node migrations/001_initial.js
```

Each migration exposes an `up()` function so a runner can apply them in order
and record the last-applied version in a `_migrations` collection.

| Version | Name           | Purpose                              |
|---------|----------------|--------------------------------------|
| 001     | initial        | Create all indexes + validators      |
