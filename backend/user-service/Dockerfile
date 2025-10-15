FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY backend backend
RUN mvn -B -f backend/pom.xml -pl user-service -am package -DskipTests

FROM eclipse-temurin:21-jre
ENV SPRING_PROFILES_ACTIVE=prod
WORKDIR /app
COPY --from=build /workspace/backend/user-service/target/user-service-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java","-jar","/app/app.jar"]
