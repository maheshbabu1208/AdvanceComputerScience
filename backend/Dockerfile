# First stage: Build TypeScript inside a Node.js container
FROM --platform=linux/amd64 node:18-bullseye AS builder

WORKDIR /app

# Copy package.json and package-lock.json first (leveraging Docker layer caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Compile TypeScript
RUN npm run build

# Second stage: Use a minimal runtime environment
FROM --platform=linux/amd64 node:18-bullseye

WORKDIR /app

# Copy only built files and production dependencies from the builder stage
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/package.json

# Expose the application port
EXPOSE 3000

CMD ["node", "dist/index.js"]
