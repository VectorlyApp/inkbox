#!/usr/bin/env bash
set -euo pipefail

REPO="testpypi"
if [[ "${1:-}" == "--prod" ]]; then
  REPO="pypi"
fi

# Load .env from repo root if present
ENV_FILE="$(dirname "$0")/../.env"
if [[ -f "$ENV_FILE" ]]; then
  set -a; source "$ENV_FILE"; set +a
  export TWINE_USERNAME="__token__"
fi

echo "==> Cleaning previous builds"
rm -rf dist/ build/ *.egg-info

echo "==> Installing build tools"
python -m pip install --quiet build twine

echo "==> Building"
python -m build

echo "==> Uploading to $REPO"
twine upload --repository "$REPO" dist/*

echo ""
if [[ "$REPO" == "testpypi" ]]; then
  echo "Done. Install with:"
  echo "  pip install --index-url https://test.pypi.org/simple/ --extra-index-url https://pypi.org/simple/ inkbox"
else
  echo "Done. Install with:"
  echo "  pip install inkbox"
fi
