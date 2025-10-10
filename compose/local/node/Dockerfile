FROM docker.io/node:24.10-bookworm-slim

WORKDIR /app

# Copy package files for dependency installation
COPY ./package*.json ./

# Install dependencies
RUN npm install && npm cache clean --force

# Add node_modules/.bin to PATH
ENV PATH=./node_modules/.bin/:$PATH

# Copy the rest of the application code
COPY . .

# Expose port for webpack dev server
EXPOSE 3000
