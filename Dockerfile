FROM macbootglass/myownportfolio-env
MAINTAINER thibault.theologien@insa-rouen.fr

VOLUME /root/dist

EXPOSE 3000
EXPOSE 1337

ENV MOP_GLOBAL_HOSTNAME=localhost
ENV MOP_GLOBAL_DIST=/root/dist

ENV MOP_CLIENT_ID=0
ENV MOP_CLIENT_SECRET=secret

COPY package.json /root
RUN npm install

COPY ./auth /root/auth
COPY ./portfolio /root/portfolio
COPY ./utils /root/utils
COPY ./express.js /root
COPY ./config.yml /root

CMD npm run start
