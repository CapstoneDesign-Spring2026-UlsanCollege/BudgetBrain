FROM node:22-alpine AS frontend
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY index.html vite.config.js ./
COPY public ./public
COPY src ./src
RUN npm run build

FROM maven:3.9.9-eclipse-temurin-21 AS backend
WORKDIR /app
COPY spring-backend/pom.xml ./pom.xml
RUN mvn -q -DskipTests dependency:go-offline
COPY spring-backend/src ./src
COPY --from=frontend /app/dist ./src/main/resources/static
RUN mvn -q -DskipTests package

FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S budgetbrain && adduser -S budgetbrain -G budgetbrain
USER budgetbrain
WORKDIR /app
COPY --from=backend /app/target/budgetbrain-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]
