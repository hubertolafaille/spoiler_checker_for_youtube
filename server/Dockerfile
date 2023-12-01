FROM maven:3.9.2-amazoncorretto-17
WORKDIR /app
COPY . /app
RUN mvn install
RUN mv /app/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]