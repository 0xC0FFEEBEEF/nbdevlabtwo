---
title: "Two-Node Proxmox Homelab with Zero-Trust Remote Access & Power-Aware Backups"
slug: "proxmox-homelab-byteme2-byteme3"
date: "2025-10-26"
status: "published"

tags:
  - Proxmox
  - Cloudflare Zero Trust
  - Proxmox Backup Server
  - VLAN Segmentation
  - Observability

constraints:
  - Sanitize IP/URL details in public docs
  - Zero Trust only (no public exposure)
  - Power-aware backups (boot PBS, shutdown after)

stack:
  - Proxmox VE
  - PBS
  - WatchGuard/Firebox
  - Cloudflare Tunnel
  - Zabbix
  - Grafana
  - Wazuh

lessons:
  - Zero Trust beats port-forwarding
  - Segment first; limit east-west
  - Gate shutdown on successful PBS jobs

# links:                 # leave commented out unless you have real URLs
#   repo: "https://example.com/repo"
#   demo: "https://demo.example.com"
---

**TL;DR**  
Two-node Proxmox lab with Zero Trust remote access, segmented networks, and power-aware backups. The primary node stays online; the backup node wakes only for jobs, then shuts down cleanly.

## Topology
- **byteme2** — Primary compute node (Proxmox). Runs most services and the Cloudflare tunnel.
- **byteme3** — Secondary server (Proxmox/PBS). Normally off; used for backups/overflow.

## Network (Sanitized)
Private **10.0.x.0/24** ranges segmented by role (Wireless / Management / Servers / Lab). Inter-VLAN routing on the firewall with least-privilege rules.

## Remote Access & Security
Cloudflare Zero Trust/Access fronts RDP and internal web UIs behind SSO and device posture checks. Catch-all rules handle unexpected requests.

## Backups & Power Orchestration
1) byteme2 sends a **BMC/IPMI power-on** to byteme3 before the backup window.  
2) PBS jobs run to storage on byteme3.  
3) On success, byteme2 issues a **graceful shutdown** to byteme3.

## Observability
Zabbix + Grafana for metrics; Wazuh for security telemetry and alerting.

## Results
Strong remote posture with no direct exposure, lower power usage by powering the backup node only when needed, and safer tinkering via VLAN segmentation.
