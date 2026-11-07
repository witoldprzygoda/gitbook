FROM node:22-alpine

WORKDIR /app

# Kopiujemy wyłącznie pliki potrzebne do działania aplikacji i serwera API Feedbacku
COPY index.html ./
COPY css ./css
COPY curriculum ./curriculum
COPY engine ./engine
COPY audio ./audio
COPY tools/serve.js ./tools/serve.js

# Katalog na trwałą bazę zgłoszeń Feedback (data/feedback.json)
RUN mkdir -p /app/data

ENV NODE_ENV=production
ENV PORT=8090

EXPOSE 8090

CMD ["node", "tools/serve.js"]
