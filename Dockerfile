FROM node:7.7.2-alpine
WORKDIR /code
COPY ./package.json /code
RUN npm install --quiet
COPY . /code
