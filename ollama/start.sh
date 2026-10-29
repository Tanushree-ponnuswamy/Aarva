#!/bin/sh
# Starts Ollama and pulls the Qwen chat model plus the embedding model on first boot (cached on the /data disk).
ollama serve &
until ollama list >/dev/null 2>&1; do sleep 1; done
ollama pull "${LLM_MODEL:-qwen3:8b}"
ollama pull "${EMBEDDING_MODEL:-bge-large}"
wait
