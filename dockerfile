# Use the official Ruby image
FROM ruby:3.2

# Install dependencies for Rails app (nodejs, npm, yarn, etc.)
RUN apt-get update -qq && apt-get install -y nodejs npm yarn

# Set working directory inside the container
WORKDIR /app

# Copy Gemfile and install Ruby gems
COPY Gemfile Gemfile.lock ./
RUN bundle install

# Copy package.json and install JavaScript dependencies (via Yarn)
COPY package.json yarn.lock ./
RUN yarn install

# Copy the rest of the app files
COPY . .

# Precompile assets (optional, for production)
RUN bundle exec rake assets:precompile || true

# Expose port for Rails
EXPOSE 3000

# Start Rails server
CMD ["rails", "server", "-b", "0.0.0.0"]
