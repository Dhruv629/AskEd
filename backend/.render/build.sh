#!/usr/bin/env bash

# Set JAVA_HOME explicitly
export JAVA_HOME=$(/usr/libexec/java_home -v 17 || echo "/usr/lib/jvm/java-17-openjdk-amd64")
export PATH=$JAVA_HOME/bin:$PATH

# Make sure wrapper is executable
chmod +x ./mvnw

# Run build
./mvnw clean install
