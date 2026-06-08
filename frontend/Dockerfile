# Stage 1: Build static assets
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Set default environment variables for production build
ARG VITE_API_URL=/api
ARG VITE_BACK_END_URL=
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_BACK_END_URL=$VITE_BACK_END_URL
RUN npm run build

# Stage 2: Runtime environment
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
