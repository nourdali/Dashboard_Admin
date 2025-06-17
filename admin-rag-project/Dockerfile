# Use an official Python runtime as the base image
FROM redhat/ubi8-minimal

# Install Python and pip using microdnf
RUN microdnf update && \
    microdnf install -y python39 python39-pip && \
    microdnf clean all

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install dependencies
RUN pip3 install -r requirements.txt

# Copy the rest of the application code
COPY . .

# Set Flask environment variables
ENV FLASK_APP=app.py
ENV FLASK_ENV=development
ENV FLASK_RUN_HOST=0.0.0.0

# Expose the port your Flask app runs on
EXPOSE 5000

# Command to run the Flask application
CMD ["python3", "app.py"]