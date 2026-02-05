include .env
.PHONY: enter-strapi enter-db enter-nginx \
        project-start project-stop app-install app-back-install \
        app-back-build app-back-run app-back-config-export app-back-config-import app-back-data-setup \
		app-back-lint app-back-format app-back-format-check \
        db\:dump db\:import


orange = \033[38;5;208m
bold = \033[1m
reset = \033[0m
message = @echo -p "${orange}${bold}${1}${reset}"

EXTRA_PARAMS ?=
UID = $(shell id -u)

#
# Executes a command in a running container, mainly useful to fix the terminal size on opening a shell session
#
# $(1) the options
#
define infra-shell
	docker-compose exec -e COLUMNS=`tput cols` -e LINES=`tput lines` $(1)
endef

#
# Make sure to run the given command in a container identified by the given service.
#
# $(1) the user with which run the command
# $(2) the Docker Compose service
# $(3) the command to run
#
define run-in-container
	@if [ ! -f /.dockerenv -a "$$(docker-compose ps -q $(2) 2>/dev/null)" ]; then \
		docker-compose exec --user $(1) $(2) /bin/sh -c "$(3)"; \
	elif [ $$(env|grep -c "^CI=") -gt 0 -a $$(env|grep -cw "DOCKER_DRIVER") -eq 1 ]; then \
		docker-compose exec --user $(1) -T $(2) /bin/sh -c "$(3)"; \
	else \
		$(3); \
	fi
endef

########################################
#              INFRA                   #
########################################

enter-strapi: ## to open a shell session in the Strapi container
	$(call infra-shell,strapi sh)

enter-db: ## to open a shell session in the database container
	$(call infra-shell,database bash)

enter-nginx: ## to open a shell session in the nginx container
	$(call infra-shell,nginx sh)

project-start: ## to start the containers
	$(call message,$(PROJECT_NAME): Starting Docker containers...)
	docker-compose up -d --remove-orphans

project-stop: ## to stop the containers
	$(call message,$(PROJECT_NAME): Stopping Docker containers...)
	docker-compose stop

app-install: ## to install app
	$(MAKE) app-back-install
	$(MAKE) app-back-build

########################
# App Backend Strapi #
########################

app-back-install: ## to install Strapi
	$(call message,$(PROJECT_NAME): Installing/updating Strapi dependencies...)
	$(call run-in-container,root,strapi,cd strapi && SHELL=/bin/bash yarn cache clean --all && yarn)
	$(call message,$(PROJECT_NAME): Strapi is ready!)

app-back-config-export: ## to export strapi
	$(call message,$(PROJECT_NAME): Exporting Strapi configuration...)
	$(call run-in-container,root,strapi,cd strapi && SHELL=/bin/bash yarn cs export)

app-back-config-import: ## to import Strapi
	$(call message,$(PROJECT_NAME): Importing Strapi configuration...)
	$(call run-in-container,root,strapi,cd strapi && SHELL=/bin/bash yarn cs import)

app-back-build: ## to build Strapi
	$(call run-in-container,root,strapi,cd strapi && SHELL=/bin/bash yarn build $(EXTRA_PARAMS))

app-back-lint: ## to run eslint
	$(call message,$(PROJECT_NAME): Analysing the code...)
	$(call run-in-container,root,strapi,cd strapi && SHELL=/bin/bash yarn lint $(EXTRA_PARAMS))
	$(call message,$(PROJECT_NAME): Test Completed...)

app-back-format: ## to format
	$(call message,$(PROJECT_NAME): Checking the code...)
	$(call run-in-container,root,strapi,cd strapi && SHELL=/bin/bash yarn format:fix $(EXTRA_PARAMS))
	$(call message,$(PROJECT_NAME): Format Completed...)

app-back-format-check: ## to format test
	$(call message,$(PROJECT_NAME): Testing the code...)
	$(call run-in-container,root,strapi,cd strapi && SHELL=/bin/bash yarn format $(EXTRA_PARAMS))
	$(call message,$(PROJECT_NAME): Test Completed...)

app-back-data-setup: ## to setup strapi
	$(MAKE) db\:drop
	$(MAKE) db\:create
	$(MAKE) db\:import
	$(call run-in-container,root,strapi,cd strapi && cp -R /backup/uploads/* public/uploads)
	$(MAKE) app-back-config-import

app-back-run: ## to run Strapi
	$(call run-in-container,root,strapi,cd strapi && SHELL=/bin/bash yarn develop)

#######################
# Database #
#######################

db\:dump: ## to dumb db
	$(call message,$(PROJECT_NAME): Creating DB dump...)
	mkdir -p $(BACKUP_DIR)/db
	@docker exec $(shell docker-compose ps -q database) mariadb-dump -u root strapi_db > $(BACKUP_DIR)/db/$(DB_DUMP_NAME).sql
	$(call message,$(PROJECT_NAME): Done!)

db\:import: ## to import db
	$(call message,$(PROJECT_NAME): Importing DB...)
	$(call run-in-container,root,database,SHELL=/bin/bash mariadb -u root strapi_db < backup/db/strapi.sql)
	$(call message,$(PROJECT_NAME): Done!)

db\:create: ## to import db
	$(call message,$(PROJECT_NAME): Creating DB...)
	@docker exec $(shell docker-compose ps -q database) mariadb -u root  -e "CREATE DATABASE strapi_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
	$(call message,$(PROJECT_NAME): Done!)

db\:drop: ## to import db
	$(call message,$(PROJECT_NAME): Dropping DB...)
	@docker exec $(shell docker-compose ps -q database) mariadb -u root  -e "DROP DATABASE IF EXISTS strapi_db"
	$(call message,$(PROJECT_NAME): Done!)