FROM node:22

WORKDIR /app

# Install dependencies
COPY package.json .
RUN npm install

# Transpile typescript
COPY tsconfig.json .
COPY src ./src
RUN npm run build

CMD npm run start
