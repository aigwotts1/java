FROM maven:3.9-eclipse-temurin-17-alpine AS build

WORKDIR /workspace
COPY pom.xml ./
RUN mvn -q -DskipTests dependency:go-offline

COPY src ./src
COPY *.html *.css *.js *.png ./
RUN mvn -q -DskipTests package

FROM eclipse-temurin:17-jre-alpine AS production

RUN addgroup -S quickdevbase && adduser -S quickdevbase -G quickdevbase
WORKDIR /app
COPY --from=build --chown=quickdevbase:quickdevbase /workspace/target/quickdevbase-1.0.0.jar app.jar

USER quickdevbase
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -q -O - http://127.0.0.1:3000/health >/dev/null || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
