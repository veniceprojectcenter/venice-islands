# Creare progetto nuovo 
rails new islands --skip-active-record --skip-keeps --skip-action-mailer \
--skip-action-cable --skip-spring --skip-turbolinks  --skip-coffee \
--skip-test --skip-system-test --skip-bootsnap

#aggiungo gemma gestione meta tags

echo "gem 'meta-tags'" >> Gemfile

bundle install

#creo controller per la pagine home

rails g controller Home index about

#aggiungo le dipendenze javascript al progetto

yarn add jquery --save 



#Collego progetto ad heroku

heroku git:remote -a vpc-islands

heroku buildpacks:set heroku/nodejs

heroku buildpacks:set heroku/ruby

