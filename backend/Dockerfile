# Stage 1: Build stage
FROM python:3.12.8-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl build-essential && \
    rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade pip && \
    pip install poetry && \
    export PATH="$(python -m site --user-base)/bin:$PATH" && \
    poetry --version

COPY poetry.lock pyproject.toml ./

RUN poetry config virtualenvs.create false && \
    poetry install --no-root --no-interaction --no-ansi

COPY app /app/app

# Stage 2: Production stage
FROM python:3.12.8-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl && \
    rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade pip && \
    pip install poetry && \
    export PATH="$(python -m site --user-base)/bin:$PATH" && \
    poetry --version

COPY --from=builder /app /app

# Install dependencies in production using poetry
RUN poetry config virtualenvs.create false && \
    poetry install --only main --no-interaction --no-ansi

EXPOSE 8000

WORKDIR /app/app

ENTRYPOINT ["poetry", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
