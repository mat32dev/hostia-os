#!/usr/bin/env bash
#
# Host.ia Edge — one-line installer for Raspberry Pi OS / Debian (ARM64 & x86_64).
#
#   curl -fsSL https://get.hostia.com/edge | sudo bash
#   — or from a checkout —
#   sudo ./install.sh
#
# Layout after install:
#   /opt/hostia-edge/current      -> /var/lib/hostia-edge/releases/<version>
#   /opt/hostia-edge/venv         shared Python venv
#   /var/lib/hostia-edge          data: SQLite, videos, releases, device_id
#   /etc/systemd/system/hostia-edge.service
#
set -euo pipefail

APP_USER="hostia"
APP_GROUP="hostia"
INSTALL_ROOT="/opt/hostia-edge"
DATA_DIR="/var/lib/hostia-edge"
SERVICE_NAME="hostia-edge"
VERSION="1.0.0"
SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

log() { printf '\033[1;32m[hostia-edge]\033[0m %s\n' "$*"; }
die() { printf '\033[1;31m[hostia-edge] ERROR:\033[0m %s\n' "$*" >&2; exit 1; }

[[ $EUID -eq 0 ]] || die "Run as root: sudo ./install.sh"

# ─── 1. System dependencies ─────────────────────────────────────────────
log "Installing system dependencies..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq --no-install-recommends \
    python3 python3-venv python3-pip \
    libglib2.0-0 libgl1 \
    v4l-utils curl ca-certificates

# ─── 2. Service user ────────────────────────────────────────────────────
if ! id -u "$APP_USER" >/dev/null 2>&1; then
    log "Creating user '$APP_USER'..."
    useradd --system --home "$INSTALL_ROOT" --shell /usr/sbin/nologin "$APP_USER"
fi
# Camera access for USB webcams.
usermod -aG video "$APP_USER" || true

# ─── 3. Directory layout ────────────────────────────────────────────────
log "Creating directories..."
mkdir -p "$INSTALL_ROOT" "$DATA_DIR/videos" "$DATA_DIR/releases/$VERSION" "$DATA_DIR/updates"

# ─── 4. Deploy code into the release directory ──────────────────────────
log "Deploying release $VERSION..."
if [[ -d "$SRC_DIR/src" ]]; then
    cp -r "$SRC_DIR/src" "$DATA_DIR/releases/$VERSION/"
    cp -r "$SRC_DIR/tests" "$DATA_DIR/releases/$VERSION/" 2>/dev/null || true
    cp "$SRC_DIR/requirements.txt" "$DATA_DIR/releases/$VERSION/"
else
    die "src/ not found next to install.sh — run it from the repository checkout"
fi
ln -sfn "$DATA_DIR/releases/$VERSION" "$INSTALL_ROOT/current"

# ─── 5. Python virtualenv ───────────────────────────────────────────────
log "Creating virtualenv (this takes a few minutes on a Pi)..."
python3 -m venv "$INSTALL_ROOT/venv"
"$INSTALL_ROOT/venv/bin/pip" install --upgrade pip -q
"$INSTALL_ROOT/venv/bin/pip" install --no-cache-dir -q \
    -r "$INSTALL_ROOT/current/requirements.txt"

# ─── 6. Configuration ───────────────────────────────────────────────────
if [[ ! -f "$INSTALL_ROOT/.env" ]]; then
    log "Creating .env from template (edit it before first start)..."
    cp "$SRC_DIR/.env.example" "$INSTALL_ROOT/.env"
    sed -i "s|^DATA_DIR=.*|DATA_DIR=$DATA_DIR|" "$INSTALL_ROOT/.env"
    sed -i "s|^APP_DIR=.*|APP_DIR=$INSTALL_ROOT/current|" "$INSTALL_ROOT/.env"
else
    log "Keeping existing $INSTALL_ROOT/.env"
fi

chown -R "$APP_USER:$APP_GROUP" "$INSTALL_ROOT" "$DATA_DIR"

# ─── 7. systemd service (auto-start on boot, memory-capped) ─────────────
log "Installing systemd unit..."
cat > "/etc/systemd/system/$SERVICE_NAME.service" <<EOF
[Unit]
Description=Host.ia Edge Agent
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=$APP_USER
Group=$APP_GROUP
SupplementaryGroups=video
WorkingDirectory=$INSTALL_ROOT/current
EnvironmentFile=$INSTALL_ROOT/.env
ExecStart=$INSTALL_ROOT/venv/bin/python -m src.main
Restart=always
RestartSec=5
# Hard budget: agent must stay under 512MB.
MemoryMax=450M
CPUQuota=150%
NoNewPrivileges=true
ProtectSystem=full
ReadWritePaths=$DATA_DIR $INSTALL_ROOT

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable "$SERVICE_NAME"

# ─── 8. Done ────────────────────────────────────────────────────────────
log "Installed. Next steps:"
echo
echo "  1. Edit credentials:   sudo nano $INSTALL_ROOT/.env"
echo "     (set DEVICE_TOKEN and CAMERA_SOURCE)"
echo "  2. Start the agent:    sudo systemctl start $SERVICE_NAME"
echo "  3. Watch the logs:     journalctl -u $SERVICE_NAME -f"
echo "  4. Local POS API:      http://<pi-ip>:8090/healthz"
echo
log "Rollback after a bad OTA: sudo systemctl stop $SERVICE_NAME && \\"
log "  sudo -u $APP_USER $INSTALL_ROOT/venv/bin/python -m src.main --rollback"
