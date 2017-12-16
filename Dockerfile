FROM macbootglass/myownportfolio-env
MAINTAINER thibault.theologien@insa-rouen.fr

VOLUME /root/dist

EXPOSE 3000

ENV MOP_SERVER_CLIENT_ID=id
ENV MOP_SERVER_CLIENT_SECRET=secret
ENV MOP_SERVER_HOST=0.0.0.0
ENV MOP_SERVER_PORT=3000

COPY package.json /root
RUN npm install

COPY ./auth /root/auth
COPY ./portfolio /root/portfolio
COPY ./express.js /root

CMD npm run start
