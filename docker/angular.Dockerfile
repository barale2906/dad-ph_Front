FROM node:20
WORKDIR /app

# Instalar dependencias globales útiles y Git (necesario para scripts de npm)
RUN apt-get update && \
    apt-get install -y git && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# El volumen se montará en tiempo de ejecución
# Las dependencias se instalan dentro del contenedor en ejecución
