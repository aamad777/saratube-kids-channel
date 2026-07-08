# SaraTube Kids Channel - On-Prem AI Lab

SaraTube Kids Channel is a self-hosted kids video platform used as a hands-on production-style lab.

## Project Goal

The goal of this lab is to convert SaraTube into a fully on-premise application with no external managed cloud dependency.

Target architecture:

- React/Vite frontend
- Self-hosted backend API
- Local PostgreSQL database
- Local or NAS-based media storage
- Local AI service using Ollama or another self-hosted model runtime
- Docker and Docker Compose
- K3s Kubernetes
- Argo CD GitOps
- Prometheus and Grafana monitoring
- Loki logging
- Velero and NAS backup
- Security hardening

## Current Status

This repository currently contains the frontend application.

The app originally included external cloud-related references. The lab goal is to remove those dependencies and replace them with self-hosted services.

## Learning Path

1. Inspect the current application
2. Remove external branding and cloud dependencies
3. Replace Supabase with local backend and PostgreSQL
4. Add local AI features
5. Containerize with Docker
6. Deploy with Docker Compose
7. Move to K3s Kubernetes
8. Manage deployment with Argo CD
9. Add monitoring, logs, backup, and security

## Rule

Work step by step. Test every change before moving to the next stage.
