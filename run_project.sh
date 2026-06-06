#!/usr/bin/env bash

# ============================================================
#  run_project.sh — Farm System Dev Runner
#  Mode 1: Local  → Next.js + Firebase Emulators (native)
#  Mode 2: Docker → docker compose up --build
# ============================================================

set -e

# --- Colors ---
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

# ── Banner ──────────────────────────────────────────────────
echo -e "${CYAN}"
echo "  🌾  Farm System — Dev Launcher"
echo "  ================================"
echo -e "${NC}"

# ── Mode Selection ──────────────────────────────────────────
echo -e "  How do you want to run the project?\n"
echo -e "  ${BOLD}[1]${NC} 🖥️   Local   — npm + Firebase Emulators (no Docker)"
echo -e "  ${BOLD}[2]${NC} 🐳  Docker  — docker compose up --build"
echo -e "  ${BOLD}[3]${NC} 🐳  Docker  — start existing containers (no rebuild)"
echo -e "  ${BOLD}[4]${NC} 🛑  Docker  — stop & remove containers"
echo ""
read -rp "  Enter choice [1-4]: " MODE
echo ""

# ============================================================
#  SHARED: .env.local check
# ============================================================
check_env() {
  if [ ! -f "$PROJECT_DIR/.env.local" ]; then
    echo -e "${RED}  ❌  ERROR: .env.local not found!${NC}"
    echo -e "     Copy the example file and fill in your Firebase credentials:"
    echo -e "     ${YELLOW}cp .env.example .env.local${NC}"
    exit 1
  fi
}

# ============================================================
#  MODE 1 — Local (npm + firebase-tools)
#  Emulator data is persisted to .emulator-data/ between runs
# ============================================================
EMULATOR_DATA_DIR="$PROJECT_DIR/.emulator-data"
run_local() {
  check_env

  # Check node_modules
  if [ ! -d "$PROJECT_DIR/node_modules" ]; then
    echo -e "${YELLOW}  📦  node_modules not found. Installing dependencies...${NC}"
    npm install
  fi

  # Check firebase-tools (install locally to avoid sudo/permission issues)
  if ! command -v firebase &> /dev/null && [ ! -f "$PROJECT_DIR/node_modules/.bin/firebase" ]; then
    echo -e "${YELLOW}  ⚠️   firebase-tools not found. Installing locally...${NC}"
    npm install --save-dev firebase-tools
  fi
  # Use local binary if global not available
  FIREBASE_CMD="firebase"
  if ! command -v firebase &> /dev/null; then
    FIREBASE_CMD="$PROJECT_DIR/node_modules/.bin/firebase"
  fi

  echo -e "${GREEN}  ✅  All checks passed. Starting services...${NC}\n"

  # Cleanup on exit
  cleanup() {
    echo ""
    echo -e "${YELLOW}  🛑  Shutting down all services...${NC}"
    kill 0
  }
  trap cleanup EXIT INT TERM

  # Start Firebase Emulators with data persistence
  if [ -d "$EMULATOR_DATA_DIR" ]; then
    echo -e "${CYAN}  🔥  Starting Firebase Emulators (restoring saved data from .emulator-data/)...${NC}"
    $FIREBASE_CMD emulators:start --only auth,firestore \
      --import "$EMULATOR_DATA_DIR" \
      --export-on-exit "$EMULATOR_DATA_DIR" &
  else
    echo -e "${CYAN}  🔥  Starting Firebase Emulators (first run — no saved data yet)...${NC}"
    $FIREBASE_CMD emulators:start --only auth,firestore \
      --export-on-exit "$EMULATOR_DATA_DIR" &
  fi
  FIREBASE_PID=$!

  sleep 4

  # Start Next.js
  echo -e "${CYAN}  🚀  Starting Next.js Dev Server...${NC}"
  npm run dev &
  NEXT_PID=$!

  print_urls
  wait $FIREBASE_PID $NEXT_PID
}

# ============================================================
#  MODE 2 — Docker (build + start)
# ============================================================
run_docker_build() {
  check_env
  check_docker

  echo -e "${CYAN}  🐳  Building and starting Docker containers...${NC}\n"
  docker compose up --build

  print_urls
}

# ============================================================
#  MODE 3 — Docker (start existing, no rebuild)
# ============================================================
run_docker_start() {
  check_env
  check_docker

  echo -e "${CYAN}  🐳  Starting existing Docker containers...${NC}\n"
  docker compose up
}

# ============================================================
#  MODE 4 — Docker Stop
# ============================================================
run_docker_stop() {
  check_docker
  echo -e "${YELLOW}  🛑  Stopping and removing Docker containers...${NC}\n"
  docker compose down
  echo -e "${GREEN}  ✅  All containers stopped.${NC}"
}

# ============================================================
#  HELPERS
# ============================================================
check_docker() {
  if ! command -v docker &> /dev/null; then
    echo -e "${RED}  ❌  Docker not found!${NC}"
    echo -e "     Install Docker Desktop: ${CYAN}https://docs.docker.com/get-docker/${NC}"
    exit 1
  fi
  if ! docker info &> /dev/null; then
    echo -e "${RED}  ❌  Docker daemon is not running. Please start Docker.${NC}"
    exit 1
  fi
}

print_urls() {
  echo ""
  echo -e "${GREEN}  ============================================${NC}"
  echo -e "${GREEN}  ✅  Farm System is running!${NC}"
  echo -e "${GREEN}  ============================================${NC}"
  echo -e "  Frontend  →  ${CYAN}http://localhost:3000${NC}"
  echo -e "  Emulator  →  ${CYAN}http://localhost:4000${NC}  (Firebase UI)"
  echo -e "  Firestore →  ${CYAN}http://localhost:8080${NC}"
  echo -e "  Auth      →  ${CYAN}http://localhost:9099${NC}"
  echo -e "${GREEN}  ============================================${NC}"
  echo ""
  echo -e "  Press ${YELLOW}Ctrl+C${NC} to stop all services."
  echo ""
}

# ============================================================
#  DISPATCH
# ============================================================
case "$MODE" in
  1) run_local ;;
  2) run_docker_build ;;
  3) run_docker_start ;;
  4) run_docker_stop ;;
  *)
    echo -e "${RED}  ❌  Invalid choice. Please enter 1, 2, 3, or 4.${NC}"
    exit 1
    ;;
esac
