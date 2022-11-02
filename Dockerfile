FROM debian:11

RUN apt-get update -yq \
    && apt-get install sudo apt-transport-https ca-certificates curl gnupg2 software-properties-common npm -yq 

RUN curl -fsSL https://download.docker.com/linux/debian/gpg \
    |sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

RUN echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" \
    | sudo tee /etc/apt/sources.list.d/docker.list

RUN sudo apt update

RUN sudo apt install -y docker-ce docker-ce-cli containerd.io

RUN docker -v

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json package-lock.json /usr/src/app/
RUN npm install && npm cache clean --force
COPY . /usr/src/app

HEALTHCHECK CMD ["npm", "run", "healthcheck"]
CMD ["npm", "run", "start"]