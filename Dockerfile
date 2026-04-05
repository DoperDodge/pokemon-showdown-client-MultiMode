FROM node:22-slim
WORKDIR /app
COPY serve.js ./
COPY <play.pokemonshowdown.com/> ./<play.pokemonshowdown.com/>
EXPOSE 3000
CMD ["node", "serve.js"]
