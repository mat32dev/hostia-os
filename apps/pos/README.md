# Host.ia POS — Free, Open-Source Point of Sale

The data backbone of HosT.ia. Order management, payments, inventory, staff, reports.

## Quick Start

```bash
docker compose up pos-api postgres redis
```

Then open http://localhost:8001/docs for the API documentation.

## Structure

```
src/
├── main.py          # FastAPI app entry point
├── models.py        # SQLAlchemy models
├── schemas.py       # Pydantic schemas
├── crud.py          # Database operations
├── database.py      # DB connection
├── auth.py          # JWT auth
├── integrations/
│   ├── chat_bridge.py    # Notify Chat Agent
│   └── guard_bridge.py   # Notify Guard Agent
├── routes/
│   ├── orders.py
│   ├── menu.py
│   ├── tables.py
│   ├── payments.py
│   ├── inventory.py
│   ├── staff.py
│   └── reports.py
└── tests/
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/orders` | POST | Create order |
| `/v1/orders/{id}` | GET | Get order |
| `/v1/menu` | GET | Get menu |
| `/v1/menu` | PUT | Update menu |
| `/v1/tables` | GET | Get tables |
| `/v1/reports/daily` | GET | Daily report |
| `/health` | GET | Health check |

## Features

- ✅ Order management (create, update, close)
- ✅ Table management (assign, split, merge)
- ✅ Split bills and modifiers
- ✅ Cash, card (Stripe), QR payments
- ✅ Inventory tracking with low-stock alerts
- ✅ Staff clock-in/out and roles
- ✅ Tips distribution
- ✅ Daily P&L, COGS, labor cost, peak hours
- ✅ REST + GraphQL API
- ✅ Offline-capable (PWA)

## Tech Stack

- FastAPI + SQLAlchemy + PostgreSQL
- Redis for caching
- Stripe for payments
- Alembic for migrations

## License

AGPL-3.0 — Free forever, share modifications.
