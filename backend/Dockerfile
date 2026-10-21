# The FastAPI backend. Build from backend/:  docker build -t jg-backend .
# Memory-light on purpose (the production box has 7 GB shared by every app): one uvicorn worker, no reload, no access
# log, glibc arenas capped, bytecode precompiled at build time. Configuration only from the environment (the same names
# as the Next.js app: DATABASE_URL, AUTH_SECRET, AUTH_URL, ...). FORWARDED_ALLOW_IPS (read by uvicorn from the
# environment) names the reverse proxy whose X-Forwarded-* headers are trusted.
# One worker on purpose: the rate limits (app/limits.py, as src/server/limits.ts) are per process.
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    MALLOC_ARENA_MAX=2 \
    FORWARDED_ALLOW_IPS=127.0.0.1

WORKDIR /app
COPY pyproject.toml ./
COPY app ./app
COPY alembic ./alembic
COPY alembic.ini ./
# uvloop + httptools: the faster event loop and HTTP parser on Linux, for about 2 MB more RSS
RUN pip install . uvloop httptools \
 && python -m compileall -q app \
 && useradd --system --uid 10001 jg
USER jg

EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8000/api/health', timeout=4).status == 200 else 1)"
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1", \
     "--no-access-log", "--no-server-header", "--proxy-headers", \
     "--timeout-keep-alive", "5", "--limit-concurrency", "200", "--backlog", "512"]
