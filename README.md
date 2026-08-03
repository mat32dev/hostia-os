# 🏛️ HosT.ia — The Open-Source, Agentic Hospitality Operating System

**Start your bar with $0 in software. Get a free POS, an AI waiter, and a security guard. Only pay when you grow.**

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)](https://opensource.org/licenses/AGPL-3.0)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## What is HosT.ia?

HosT.ia is the first open-source, agentic hospitality operating system. Three products, one platform:

- **🧾 Host.ia POS** — Free, open-source point-of-sale. Works offline. Runs on anything.
- **💬 Host.ia Chat** — AI waiter on WhatsApp. Reservations, orders, FAQs. 24/7.
- **🛡️ Host.ia Guard** — AI security analyst. Monitors cash transactions via video.

All three share a brain. All three are open-source. All three talk to each other.

## Quick Start

```bash
git clone https://github.com/hostia-os/hostia-os.git
cd hostia-os
make up
```

Then open:
- **POS UI**: http://localhost:3000
- **Chat API**: http://localhost:3001
- **Guard API**: http://localhost:8002
- **POS API**: http://localhost:8001
- **MinIO Console**: http://localhost:9001

## Architecture

```
Client (Tablet/Camera/Phone)
         │
         ▼
    Edge Agent (optional)
         │
         ▼
    Cloud Platform (K8s)
    ├── API Gateway (Kong)
    ├── Auth (Keycloak)
    ├── Billing (Stripe)
    │
    ├── Agentic Orchestration (LangGraph + CrewAI)
    │   ├── Director (routes tasks)
    │   ├── Chat Agent (WhatsApp + LLM)
    │   ├── Guard Agent (YOLO + VLM)
    │   └── POS Agent (Orders + Payments)
    │
    ├── Services (FastAPI + Node.js)
    │   ├── POS Service
    │   ├── Guard Service
    │   └── Chat Service
    │
    └── Infrastructure
        ├── PostgreSQL (main DB)
        ├── Redis (queue/cache)
        ├── Qdrant (vector DB)
        └── MinIO (object storage)
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 + Tailwind + shadcn/ui |
| POS UI | React + PWA (offline) |
| Backend | FastAPI (Python) + Node.js |
| AI/ML | PyTorch + Transformers + Ollama |
| Agents | LangGraph + CrewAI |
| Database | PostgreSQL 16 + TimescaleDB |
| Vector DB | Qdrant |
| Cache/Queue | Redis + Celery |
| Storage | MinIO (S3-compatible) |
| Auth | Keycloak |
| Gateway | Kong |
| Infra | Docker + Kubernetes + Helm |
| Observability | Grafana + Prometheus + Loki |
| WhatsApp | WhatsApp Business API (Meta) |
| Video | FFmpeg + OpenCV |
| CV Models | YOLOv8 + SmolVLM2 / Qwen2.5-VL |

## Products

### Host.ia POS — Free Forever
The data backbone. Order management, payments, inventory, staff, reports.
- **License**: AGPL-3.0
- **Deploy**: Cloud, self-hosted, or hybrid
- **Hardware**: Tablets, old laptops, dedicated terminals

### Host.ia Chat — AI Front-of-House
The face of your business. Reservations, orders, FAQ, takeout.
- **License**: MIT
- **Channel**: WhatsApp Business API
- **AI**: POS-aware, multi-language, learns from your menu

### Host.ia Guard — AI Security Analyst
The eyes on your cash. Video analysis, anomaly detection, theft prevention.
- **License**: MIT
- **Input**: RTSP camera or video upload
- **AI**: YOLO + VLM, learns from your feedback

## Development

```bash
# Start everything
make up

# Individual services
make pos      # POS only
make guard    # Guard only
make chat     # Chat only
make hub      # Dashboard only

# Tests
make test

# Lint
make lint

# Database
make db-migrate
make db-reset

# Clean
make clean
```

## Self-Hosting

See [docs/self-hosting](docs/self-hosting/) for:
- Raspberry Pi 5 setup
- Docker Compose production
- Kubernetes deployment
- Backup and recovery

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). We welcome:
- Bug reports
- Feature requests
- Pull requests
- Plugin development
- Translation (i18n)

## License

- **POS**: [AGPL-3.0](LICENSE) — Free forever, share modifications
- **Guard**: [MIT](LICENSE) — Use freely, open-source models
- **Chat**: [MIT](LICENSE) — Core logic open

## Community

- **GitHub**: [github.com/hostia-os](https://github.com/hostia-os)
- **Discord**: Coming soon
- **Docs**: [docs.hostia.com](https://docs.hostia.com) (coming soon)

---

**Built with ❤️ by the HosT.ia community**
