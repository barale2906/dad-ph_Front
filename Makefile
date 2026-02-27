.PHONY: up down start stop restart ps logs angular npm init show-urls

up:
	@echo "=> Levantando contenedores (build incluido)..."
	docker compose up -d --build
	@$(MAKE) show-urls

init:
	@echo "=> Inicializando proyecto por primera vez..."
	@$(MAKE) up
	@echo "=> Instalando dependencias de npm..."
	docker compose exec angular npm install
	@echo "=> Inicialización completada."
	@$(MAKE) show-urls

down:
	@echo "=> Deteniendo y eliminando contenedores/red..."
	docker compose down

stop:
	@echo "=> Deteniendo contenedores (sin borrar datos)..."
	docker compose stop

start:
	@echo "=> Iniciando contenedores existentes..."
	docker compose start
	@$(MAKE) show-urls

restart:
	@echo "=> Reiniciando contenedores..."
	docker compose restart
	@$(MAKE) show-urls

ps:
	@echo "=> Estado de servicios:"
	docker compose ps

logs:
	docker compose logs -f $(filter-out $@,$(MAKECMDGOALS))

angular:
	docker compose exec angular bash

npm:
	docker compose exec angular npm $(filter-out $@,$(MAKECMDGOALS))

show-urls:
	@echo ""
	@echo "=> Accesos:"
	@echo "   Angular (dev): http://localhost:4200"
	@echo ""
	@echo "=> Comandos útiles:"
	@echo "   make npm install     - Instalar dependencias"
	@echo "   make npm -- run ng generate component X  - Generar componente"
	@echo "   make angular        - Acceder al contenedor"
	@echo ""

%:
	@:
