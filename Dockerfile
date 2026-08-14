FROM node:22-alpine AS production

ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --chown=node:node server.js index.html styles.css app.js docker-data.js ai-data.js ai.html ai.css ai.js home.html home.css home.js team.html \
  certificate.css certificate.js legal.css privacy.html terms.html certificate-policy.html quickdevbase-logo.png founder-abhinav.png ./

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
