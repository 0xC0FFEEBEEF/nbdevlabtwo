---
title: Two-Node Proxmox Homelab with Zero-Trust Remote Access & Power-Aware Backups
slug: proxmox-homelab-byteme2-byteme3
date: 2025-10-26
status: building
tags:
  - Proxmox
  - Homelab
  - Cloudflare Zero Trust
  - ProLiant
  - IPMI/iLO
  - Proxmox Backup Server
  - VLAN Segmentation
  - Energy Efficiency
  - Zabbix
  - Grafana
  - Wazuh
problem: I needed a secure, reliable homelab I could reach from anywhere without
  exposing services directly to the internet—and I wanted backups without
  keeping a second server idling 24/7.
constraints:
  - "No public exposure of management planes (Zero Trust only)  Private
    addressing only; sanitized 10.0.x.0/24 ranges segmented by role  Power
    budget: the backup node should be off except during jobs  Keep costs low;
    reuse enterprise hardware  Don’t publish detailed IP/URL schemes in public
    docs"
stack:
  - "Compute/Virtualization: Proxmox VE on two nodes  byteme2: HPE ProLiant
    (primary"
  - "runs most services + Cloudflare tunnel)  byteme3: Intel S1600JP (PBS +
    overflow; normally powered off)  Backups: Proxmox Backup Server on
    byteme3  Power Control: BMC/IPMI/iLO triggered from byteme2  Network &
    Security: WatchGuard/Firebox (mixed routing)"
  - VLAN segmentation (Wireless / Management / Servers / Lab in 10.0.x.0/24
    ranges)
  - "least-privilege inter-VLAN rules  Remote Access: Cloudflare Zero Trust
    (Access + cloudflared) fronting RDP and internal web apps  Observability:
    Zabbix + Grafana; Wazuh for security telemetry  Guests/Services (examples):
    directory/DNS"
  - monitoring stack
  - code hosting
  - sandboxes (mix of QEMU + LXC/Debian/Ubuntu)
lessons:
  - "Zero Trust beats port-forwarding; posture + SSO keeps attack surface
    tiny  Segment first—VLANs limit blast radius far better than later
    cleanup  Power-aware backups matter: BMC boot → PBS job → graceful shutdown
    saves watts and noise  Add health-check gates so shutdown only happens after
    successful jobs  Keep published apps minimal; use catch-all rules for
    anything unexpected  Document publicly with sanitized ranges/hostnames only"
links:
  repo: ""
---
**TL;DR**  
Two-node Proxmox lab with Zero Trust remote access, segmented networks, and power-aware backups. The primary node stays online; the backup node wakes only for jobs, then shuts down cleanly.

## Goals
- Secure remote access without public exposure  
- Reliable, automated backups with minimal idle power draw  
- Clean network segmentation for safer experimentation

## Topology
- **byteme2** — Primary ProLiant compute node (Proxmox). Runs most services, Cloudflare tunnels, and orchestration.  
- **byteme3** — Secondary Intel server (Proxmox/PBS). Normally off; used for backups and overflow compute.

## Network (Sanitized)
- Private **10.0.x.0/24** address spaces with VLANs for **Wireless**, **Management**, **Servers**, and **Lab**.  
- Mixed-routing firewall enforces least-privilege east-west access.  
- Management surfaces restricted to the management segment + Zero Trust.

## Remote Access & Security
- **Cloudflare Zero Trust/Access** fronts RDP and internal web UIs behind SSO and device posture checks.  
- Tunnels originate from byteme2; only the required apps/routes are published.  
- Catch-all rules handle unexpected requests.

## Backups & Power Orchestration
1. byteme2 sends a **BMC/IPMI power-on** to byteme3 before the backup window.  
2. **Proxmox Backup Server** jobs run to PBS storage on byteme3.  
3. On success, byteme2 issues a **graceful shutdown** to byteme3.  
_Result:_ dependable restore points without 24/7 idle power on the backup node.

## Observability
- Zabbix + Grafana dashboards for host/vm metrics and capacity trends.  
- Wazuh for security telemetry and alerting.

## Results
- Strong remote posture with **no direct exposure**.  
- Lower power usage and noise by powering the backup node only when needed.  
- Safer tinkering thanks to VLAN segmentation and scoped policies.

## What’s Next
- Gate shutdown on explicit PBS job success + storage health checks.  
- IaC/runbooks for Cloudflare Access app inventory and firewall policies.  
- Expand per-VLAN traffic and PBS capacity visualizations in Grafana.
