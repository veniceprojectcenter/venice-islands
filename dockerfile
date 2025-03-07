# Use the official Ruby image
FROM ruby:3.2

# Install dependencies for Rails app (nodejs, npm, yarn, etc.)
RUN apt-get update -qq && apt-get install -y nodejs npm yarn


RUN bundle install

RUN yarn install


# Precompile assets (optional, for production)
RUN bundle exec rake assets:precompile || true

# Expose port for Rails
EXPOSE 3000

# Start Rails server
CMD ["rails", "server", "-b", "0.0.0.0"]
