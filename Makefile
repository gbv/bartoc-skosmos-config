build:
	docker compose build && docker compose down -v && docker compose up -d --force-recreate 

.PHONY: config

config: 
	cat config-dev.ttl vocabularies.ttl > config/config-docker-compose.ttl
