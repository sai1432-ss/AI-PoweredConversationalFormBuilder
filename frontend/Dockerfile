FROM node:20-slim

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

RUN npm run build

# Using 'serve' to host the static files on port 3000
RUN npm install -g serve
EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]