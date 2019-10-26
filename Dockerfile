FROM node:13-slim
EXPOSE 3000
WORKDIR /app
COPY index.js .
COPY ts3Sync.js .
COPY package.json .
RUN npm install
RUN chown -R node:node /app
USER node
ENTRYPOINT ["node", "index.js"]