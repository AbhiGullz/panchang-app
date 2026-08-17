# Private phone testing with Tailscale Serve

This creates a private HTTPS link for devices signed into the same Tailscale tailnet. It does **not** make the app public. Do not use `tailscale funnel` for this workflow.

## One-time tailnet setup

In the Tailscale admin console, enable MagicDNS and HTTPS certificates. Tailscale will show a consent link if this has not already been enabled.

## On H Kamgar

Run these commands from the checkout after pulling `main`:

```bash
cd ~/PanchangApp
cd frontend && npm ci && npm run build
cd ../backend
python3.12 -m venv .venv
.venv/bin/python -m pip install -r requirements.lock
PANCHANG_FRONTEND_DIST=../frontend/dist PYTHONPATH=. .venv/bin/python -m uvicorn api.main:app --host 127.0.0.1 --port 8000
```

In a second terminal on H Kamgar:

```bash
tailscale serve --bg --https=443 http://127.0.0.1:8000
tailscale serve status
```

Open the displayed `https://<machine>.<tailnet>.ts.net` address on the phone while the Tailscale app is connected to the same tailnet. The page and `/api/v1/*` are served from the same private HTTPS origin.

## Stop the private preview

```bash
tailscale serve --https=443 off
```

Then stop the foreground Uvicorn process with `Ctrl+C`.

## Before sharing more widely

- Verify the phone is enrolled in the tailnet and access rules allow the H Kamgar node.
- Use `tailscale serve`, not Funnel, so the URL remains tailnet-only.
- Record the deployed commit ID and expose the corresponding AGPL source URL in the app before a public or wider beta.
