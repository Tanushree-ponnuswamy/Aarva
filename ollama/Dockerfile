FROM ollama/ollama:latest
ENV OLLAMA_HOST=0.0.0.0:11434 \
    OLLAMA_MODELS=/data/models \
    OLLAMA_KEEP_ALIVE=24h
COPY start.sh /start.sh
ENTRYPOINT ["/bin/sh", "/start.sh"]
