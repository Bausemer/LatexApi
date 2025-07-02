# Use official Node.js runtime as base image
FROM node:18-bullseye

# Install TeX Live and required packages for comprehensive LaTeX support
RUN apt-get update && apt-get install -y \
    texlive-latex-base \
    texlive-latex-recommended \
    texlive-latex-extra \
    texlive-fonts-recommended \
    texlive-fonts-extra \
    texlive-science \
    texlive-pictures \
    texlive-luatex \
    texlive-xetex \
    texlive-plain-generic \
    texlive-lang-european \
    latexmk \
    ghostscript \
    imagemagick \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --production

# Copy and set up startup script
COPY docker-start.sh /app/docker-start.sh
RUN chmod +x /app/docker-start.sh

# Create necessary directories with proper permissions
RUN mkdir -p uploads generated && \
    chmod 755 uploads generated

# Set up LaTeX environment
ENV TEXMFCACHE=/tmp/texfonts
RUN mkdir -p /tmp/texfonts && chmod 777 /tmp/texfonts

# Expose port
EXPOSE 3000

# Use startup script
CMD ["/app/docker-start.sh"] 