FROM node:20.10 as development

WORKDIR /app

COPY package.json .

COPY . .

RUN npm install

RUN npx prisma generate

RUN npm run build
