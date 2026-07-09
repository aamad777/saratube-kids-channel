# SaraTube Security Pre-Check

This checklist must be completed before deploying SaraTube.

## Checks before deployment

1. Confirm Git branch and clean status

Command:
git branch --show-current
git status --short

Expected:
- Correct branch
- No output from git status --short

2. Confirm real .env is not committed

Command:
git ls-files | grep -E '^\.env$|^\.env\.'

Expected:
- Only .env.example should appear
- Real .env must not be tracked

3. Build frontend

Command:
npm run build

Expected:
- Build completes successfully

4. Build backend Docker image

Command:
docker build -t saratube-backend:precheck -f backend-api/Dockerfile backend-api

Expected:
- Image builds successfully

5. Build frontend Docker image

Command:
docker build -t saratube-frontend:precheck -f Dockerfile .

Expected:
- Image builds successfully

6. Start Docker Compose stack

Command:
docker compose up -d --build
docker compose ps

Expected:
- postgres healthy
- backend-api healthy
- frontend healthy

7. Check backend health

Command:
curl -i http://localhost:4000/api/health

Expected:
HTTP/1.1 200 OK

8. Check frontend

Command:
curl -I http://localhost:8081
curl -I http://localhost:8081/parent-dashboard

Expected:
HTTP/1.1 200 OK

9. Run Trivy scan

Command:
trivy fs --scanners vuln,secret,misconfig --severity CRITICAL,HIGH --ignore-unfixed .

Expected:
- Backend package-lock clean
- Dockerfiles have 0 misconfigurations
- No secrets detected
- Known frontend dependency findings are reviewed

Known accepted findings:
Frontend package-lock.json currently has HIGH findings related to glob, lodash, minimatch, and picomatch.
These will be handled in a separate dependency upgrade task.

10. Confirm Ollama design

SaraTube does not run Ollama inside Compose.
Backend connects to existing local Ollama using:

OLLAMA_URL=http://host.docker.internal:11434

Command:
docker ps | grep -i ollama
curl -i http://localhost:11434/api/tags

11. Deployment decision

Deploy only if:
- Git is clean
- .env is not tracked
- Builds pass
- Docker images build
- Compose stack is healthy
- Backend returns 200
- Frontend returns 200
- Trivy has no new CRITICAL or unexplained HIGH findings
