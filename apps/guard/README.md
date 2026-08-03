# Host.ia Guard — AI Security Analyst

The eyes on your cash. Video analysis, anomaly detection, theft prevention.

## Quick Start

```bash
docker compose up guard-api guard-worker postgres redis minio
```

Then open http://localhost:8002/docs for the API documentation.

## Structure

```
src/
├── main.py          # FastAPI app entry point
├── pipeline.py      # VideoPipeline (YOLO + VLM)
├── models.py        # SQLAlchemy models
├── schemas.py       # Pydantic schemas
├── db.py            # DB connection
├── pipeline/
│   ├── extractor.py  # Frame extraction (FFmpeg)
│   ├── detector.py   # YOLOv8 detection
│   ├── analyzer.py   # VLM analysis (SmolVLM2)
│   ├── matcher.py    # POS matching
│   └── alerter.py    # Alert generation
└── tests/
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/videos/upload` | POST | Upload video for analysis |
| `/v1/videos/{id}` | GET | Get analysis status |
| `/v1/expected-payments` | POST | Register expected cash payment |
| `/v1/reports/{date}` | GET | Get daily report |
| `/v1/alerts/{id}/resolve` | POST | Resolve alert |
| `/health` | GET | Health check |

## The Pipeline

1. **Extract**: FFmpeg extracts keyframes from video (1fps, activity-filtered)
2. **Detect**: YOLOv8 detects hands, people, cash, POS screens
3. **Analyze**: VLM (SmolVLM2) analyzes each flagged frame
4. **Match**: Compare detected events vs POS expected payments
5. **Alert**: Generate alerts for discrepancies

## Detection Matrix

| POS Sale | Visual Confirmed | Result |
|----------|-----------------|--------|
| ✅ Yes | ✅ Yes | ✅ Verified |
| ✅ Yes | ❌ No | ⚠️ Unverified sale |
| ❌ No | ✅ Yes | 🚨 Unregistered transaction |
| ❌ No | ❌ No | ⏸️ No action |

## License

MIT — Use freely, open-source models.
