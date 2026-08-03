FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy application
COPY . .

# Expose port
EXPOSE 3001

# Run in development
CMD ["npm", "run", "dev"]
