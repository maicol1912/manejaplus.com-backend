# Etapa de dependencias
FROM node:21-alpine3.19 AS deps

WORKDIR /usr/src/app

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY .npmrc ./

RUN npm install -g pnpm@latest

RUN pnpm install

# Etapa de construcción
FROM node:21-alpine3.19 AS build

WORKDIR /usr/src/app

# Copiar de deps, los módulos de node
COPY --from=deps /usr/src/app/node_modules ./node_modules

# Copiar todo el código fuente de la aplicación
COPY . .

RUN npm run build

# Etapa de producción
FROM node:21-alpine3.19 AS prod

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/node_modules ./node_modules

# Copiar la carpeta de DIST
COPY --from=build /usr/src/app/dist ./dist

# Copiar package.json y pnpm-lock.yaml
COPY package.json ./
COPY pnpm-lock.yaml ./

# Copiar assets y certs
COPY --from=build /usr/src/app/assets ./assets
COPY --from=build /usr/src/app/certs ./certs

EXPOSE 443

CMD [ "npm", "run", "start:prod" ]
