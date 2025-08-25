---
title: HP ProLiant DL360 Gen9 — my homelab workhorse
description: Turning an inexpensive enterprise server into a reliable Proxmox
  node powering security, web, dev, and AI workloads.
tags:
  - dl360
  - homelab
  - proxmox
featured: false
weight: 90
pubDate: 2025-08-24T19:00:00.000-05:00
draft: false
---
I picked up an HP DL360 Gen9 for homelab duty and turned it into my Proxmox node, byteme2. It’s not flashy, but it’s fast, stable, and easy to manage. This box now carries most of my day-to-day lab services with room to spike when I run heavy workloads.



why this machine?

– I always wanted a server to play with, and I was able to afford it  

– Proxmox makes it simple to snapshot, roll back, and separate roles cleanly  

– mirrors a lot of what I touch at work, so time spent here pays off on the job



hardware in short  

– HP ProLiant DL360 Gen9  

– dual Intel Xeon E5 v4 family  

– 64 GB DDR4 ECC  

– storage split into tiers: SSD for hot VMs, HDD for bulk and archives (LVM-thin for snapshots on the fast tier)  

– quad 1 GbE plus iLO for management



what I’m running on it  

containers  

– pihole for DNS control and blocking  

– otrs - trash lxc, was just experimenting

– darkcanvas - curiosity killed the cat



vms  

– Wazuh for security monitoring and lab EDR/SIEM work  

– Windows Server for AD/policy labs  

– Ubuntu as a utility/jump host  

– Gitea for my repos and automation, currently not being utilized anymore as it makes no sense

– WordPress sandbox for content experiments  

– Cryo-AI for local model running with openwebui and some other tasks  

– Archangel as my Arch dev box, main OS, but Im in a transition from moving PVE from my gaming pc to this server, so it currently isnt being used, unfortunately, I love arch as a daily driver.

– CSC-306-NB-VM for coursework



how I lay it out  

– small, single-purpose VMs that are easy to back up and blow away  

– CTs for lightweight tasks and security not as a priority 

– Zero-trust remote access + iLO so I can fix things without being on-prem, however I have switched to tailscale and am looking into a vps.



backups and recovery  

– nightly vzdump snapshots with rotation and verifies  

– critical guests get a second copy onto HDD storage  

– I’ve already had to rescue a failing disk with ddrescue in this lab, so I keep notes and a repeatable path to restore



observability  

– Proxmox metrics today; Grafana/Prometheus/Netdata are on deck for a nicer status view, however these items need work with the hardware switch. 

– Wazuh gives me security telemetry across the lab  

– simple alerts into my existing Home Assistant flow so I actually hear about problems



gpu / ai thoughts  

The DL360 G9 isn’t made for fat consumer cards, but I’m testing practical passthrough options that keep cost sane while giving me workable performance for local LLMs. When I lock a stable setup, I’ll publish temps, throughput, and the exact steps.



what I’ve learned so far  

– used enterprise gear becomes amazing with modern tooling and good notes  

– boundaries matter: one VM per purpose saves me later  

– SSD for hot, HDD for cold keeps cost in check without killing UX  

– iLO plus zero-trust access is real remote ops, safely  

– documentation beats memory, especially on weird recovery days



next for this box  

– wire up Grafana/Prometheus for a clean, shareable status page  

– finish the GPU passthrough plan and post reproducible steps + benchmarks, however I need to source a deal for a GPU 

– add some self-healing checks that restart/notify automatically  

– layer in and learn Terraform/Ansible so I can rebuild the whole node with one command



files and screenshots  

I’ll drop additional details and such as I get time.
