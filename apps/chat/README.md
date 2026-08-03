# Host.ia Chat — AI Front-of-House

The face of your business. Reservations, orders, FAQ, takeout. All on WhatsApp.

## Quick Start

```bash
docker compose up chat-api pos-api guard-api
```

Then open http://localhost:3001 for the service.

## Structure

```
src/
├── server.ts           # Express server
├── whatsapp.ts         # WhatsApp Business API client
├── pos-client.ts       # POS API client
├── guard-client.ts     # Guard API client
├── agent-director.ts   # Intent classification + routing
├── types.ts            # TypeScript types
├── utils.ts            # Helpers
└── tests/
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/webhook/whatsapp` | POST | Incoming WhatsApp messages |
| `/v1/forward-alert` | POST | Guard → WhatsApp alerts |
| `/v1/send` | POST | Send message programmatically |
| `/health` | GET | Health check |

## Intent Types

- `reservation` → Book table, check availability
- `order` → Takeout/delivery orders
- `menu_query` → Menu questions, allergens, prices
- `guard_alert` → Owner asking about security alerts
- `general` → FAQ, hours, location, contact

## Features

- ✅ WhatsApp Business API integration
- ✅ Intent classification (NLP)
- ✅ POS-aware responses (real-time inventory)
- ✅ Multi-language support
- ✅ Alert forwarding (Guard → WhatsApp)
- ✅ Interactive buttons (confirm, investigate, resolve)
- ✅ Conversation history
- ✅ Rate limiting per user

## Tech Stack

- Node.js + Express + TypeScript
- WhatsApp Business API (Meta)
- OpenAI / LangChain for NLP
- Redis for session management

## License

MIT — Core logic open.
