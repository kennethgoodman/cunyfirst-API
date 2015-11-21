require 'dotenv/tasks'
gem 'heroku-api'
#!/usr/bin/env ruby
task :default => :dotenv do
    namespace :heroku do
	  desc 'restarts all the heroku dynos so we can control when they restart'
	  task :implode do
	    Heroku::API.
	      new(username: ENV['HEROKU_EMAIL'], password: ENV['HEROKU_PASSWORD']).
	      post_ps_restart(ENV['HEROKU_APP_NAME'])
	  end
	end
end




