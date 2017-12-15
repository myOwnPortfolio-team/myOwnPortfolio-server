FROM macbootglass/myownportfolio-env
MAINTAINER thibault.theologien@insa-rouen.fr

VOLUME /var/run/docker.sock
VOLUME /bin/docker
VOLUME /root/dist

ENV MOP_SERVER_CLIENT_ID=id
ENV MOP_SERVER_CLIENT_SECRET=secret

COPY package.json /root
RUN npm install

COPY ./auth /root/auth
COPY ./portfolio /root/portfolio
COPY ./express.js /root

CMD npm run start
