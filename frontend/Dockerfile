# Step 1: Build the Angular app
FROM node:18 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build --prod

# Step 2: Serve with Nginx
FROM nginx:alpine

# Copy built app to Nginx html directory
COPY --from=build /app/dist/frontend /usr/share/nginx/html

# Copy a default nginx config (optional)
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
