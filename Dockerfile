FROM macbootglass/myownportfolio-env
MAINTAINER thibault.theologien@insa-rouen.fr

VOLUME /root/dist

EXPOSE 3000

ENV MOP_SERVER_WEB_HOST=0.0.0.0
ENV MOP_SERVER_WEB_PORT=3000

ENV MOP_SERVER_WEBSOCKET_HOST=0.0.0.0
ENV MOP_SERVER_WEBSOCKET_PORT=1337

ENV MOP_CLIENT_ID=id
ENV MOP_CLIENT_SECRET=secret

COPY package.json /root
RUN npm install

COPY ./auth /root/auth
COPY ./portfolio /root/portfolio
COPY ./express.js /root

CMD npm run start
