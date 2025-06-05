FROM node:24-slim
WORKDIR /home/node/app
COPY app /home/node/app
RUN npm install
CMD node index.js