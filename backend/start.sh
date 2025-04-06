#!/bin/bash

# Uruchom backend (uvicorn) w tle
poetry run uvicorn main:app --host 0.0.0.0 --port 8000 --reload &

# Poczekaj aż backend się uruchomi
sleep 30

echo "➡️ Uruchamiam skrypt dodający filmy..."
poetry run python /app/app/init_movies.py

# Trzymaj kontener aktywnym (opcjonalnie)
wait
