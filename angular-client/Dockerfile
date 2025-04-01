# Stage 1: Build the Angular app
FROM node:18 AS build

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

RUN npm install

# Copy the rest of the application
COPY . .

# Debug: Show contents before build
RUN echo "Contents before build:" && ls -la

# Ensure environments directory exists
RUN mkdir -p src/environments

# Get environment variables from build args
ARG API_URL_DEV
ARG API_URL_PROD
ARG OPENAI_API_KEY
ARG RESEND_API_TOKEN

# Create environment files using the build args
RUN echo "export const environment = { \
  production: true, \
  apiUrl: '${API_URL_PROD}', \
  openaiApiKey: '${OPENAI_API_KEY}', \
  resendApiToken: '${RESEND_API_TOKEN}' \
};" > src/environments/environment.prod.ts

RUN echo "export const environment = { \
  production: false, \
  apiUrl: '${API_URL_DEV}', \
  openaiApiKey: '${OPENAI_API_KEY}', \
  resendApiToken: '${RESEND_API_TOKEN}' \
};" > src/environments/environment.ts

# Build for production
RUN npm run build

# Debug: Show the build output structure
RUN echo "Build output structure:" && ls -la dist/
RUN find dist -type d | sort
RUN find dist -type f | sort

# Stage 2: Serve the app with Nginx
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy the built app - with the new application builder structure
COPY --from=build /app/dist/angular-client/browser /usr/share/nginx/html/

# Rename index.csr.html to index.html if it exists and index.html doesn't
RUN if [ -f /usr/share/nginx/html/index.csr.html ] && [ ! -f /usr/share/nginx/html/index.html ]; then \
      mv /usr/share/nginx/html/index.csr.html /usr/share/nginx/html/index.html; \
    fi

# Debug: Show contents of nginx html directory
RUN echo "Contents of nginx html directory:" && ls -la /usr/share/nginx/html/

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
