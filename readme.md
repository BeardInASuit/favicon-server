# Favicon Server

Favicon Server is a lightweight and efficient server designed to serve favicons for any website, based on their shortcut icons or favicons. It is available as a Docker image for easy deployment and integration.

## Features

- Simple and lightweight
- Handle shortcut icon and favicon
- Support caching
- Fast and efficient
- Easy to deploy using Docker

## Getting Started

### Prerequisites

- Docker installed on your machine

### Installation

1. Pull the Docker image from Docker Hub:

    ```sh
    docker pull beardinasuit/favicon-server
    ```

2. Run the Docker container:

    ```sh
    docker run -d -p 3000:3000 beardinasuit/favicon-server
    ```

3. The server will be running and serving favicons on port 3000.

## Usage

To use the Favicon Server, simply point your web application's favicon requests to the server's URL.

Example:

```html
<img src="http://your-favicon-server-ip/https://google.com">
or
<img src="http://your-favicon-server-ip/32/https://google.com">
```

## License

This project is licensed under the MIT License.

## Docker Hub

The Docker image for Favicon Server is available at [Docker Hub](https://hub.docker.com/r/beardinasuit/favicon-server).
