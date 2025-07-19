# Use an official Java 17 runtime as a parent image
FROM eclipse-temurin:17-jdk

# Set working directory
WORKDIR /app

# Copy the built jar from target
COPY target/backend-0.0.1-SNAPSHOT.jar app.jar

# Expose port (Spring Boot default)
EXPOSE 8080

# Run the jar
ENTRYPOINT ["java", "-jar", "app.jar"]
