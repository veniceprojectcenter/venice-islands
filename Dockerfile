# Use the official Ruby image as a base image
FROM ruby:2.6.4

# Install dependencies for Ruby on Rails (including npm and git)
RUN apt-get update -qq && apt-get install -y \
  nodejs \
  npm \
  git \
  && rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /app

# Clone the repository from GitHub
RUN git clone https://github.com/veniceprojectcenter/venice-islands.git

# Navigate into the project directory
WORKDIR /app/venice-islands

# Update RubyGems and install Rails
RUN gem update --system 3.3.22
RUN gem install rails

# Configure bundle to force the Ruby platform and install Ruby gems
RUN bundle config set force_ruby_platform true
RUN bundle install

# Install npm dependencies
RUN npm install

# Expose port 3000 for Rails
EXPOSE 3000

# Start the Rails server when the container runs
CMD ["rails", "server", "-b", "0.0.0.0"]
