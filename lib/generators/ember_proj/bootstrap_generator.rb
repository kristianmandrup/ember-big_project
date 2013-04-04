require 'generators/ember_proj/gem_helper'
require 'fileutils'

module EmberProj
  module Generators
    class BootstrapGenerator < Rails::Generators::Base
      class_option :csv, type: :boolean, default: true,
                   desc: 'Add client side validations integration'

      class_option :emblem, type: :boolean, default: false,
                   desc: 'Use Emblem templates (like slim)'

      class_option :auth, type: :array, default: [],
                   desc: 'Authentication libraries to use (oauth2, auth)'

      def skeleton
        directory "app", "app/assets/javascripts/app"
      end

      def move_ember_files
        move_to_app 'views/application_view', 'controllers/application_controller'
        move 'store', 'app/stores/store'
        move 'router', 'app/routes/router'
      end

      def authentications
        return if auth.blank?

        validate_auth! 
        use_auth_gems.each do |name|
          auth_notice name

          gem name unless has_gem? name
        end
      end

      def emblem
        return unless emblem?
        gem 'emblem-rails' unless has_gem? 'emblem-rails'

        say "Note: Emblem templates have the form: my_template.js.emblem", :green
      end

      def client_side_validations
        return unless csv?
        gem 'client_side_validations' unless has_gem? 'client_side_validations'
        gem 'client_side_validations-ember' unless has_gem? 'client_side_validations-ember'
      end

      def bundle_all
        bundle_gems!

        invoke "client_side_validations:ember:install" if csv?
      end        

      def notices
        extras_notice
        other_gems_notice
      end

      protected

      include EmberProj::GemHelper

      def auth_notice name
        say "See: #{auth_repo name} for authentication configuration details", :green
      end

      def auth_repo name
        case name.to_s
        when 'ember-auth-rails'
          'https://github.com/heartsentwined/ember-auth-rails'
        when 'ember-oauth2-rails'
          'https://github.com/amkirwan/ember-oauth2'
        else
          say "Invalid auth gem: #{name}, must be oauth2 or auth", :red
          exit
        end
      end        

      def validate_auth!
        unless auth_gems.include? auth
          say "Not a supported authentication gem: #{auth}. Must be one of #{auth_gems}", :red
        end
      end

      def use_auth_gems
        [auth].flatten & auth_gems
      end

      def auth
        @auth ||= options[:auth].map do |name|
          case name
          when 'oauth', 'oauth2', 'ember-oauth', 'ember-oauth2'
            'ember-oauth2-rails'
          when 'auth', 'ember-auth'
            'ember-auth-rails'
          else
            name
          end
        end
      end

      def auth_gems
        %w{ember-auth-rails ember-oauth2-rails}
      end

      def move_to_app src, target
        src = js_path(src)
        target = js_app_path(target)

        move_it! src, target
      end

      def move src, target
        src = js_path(src)
        target = js_path(target)

        move_it! src, target
      end

      def move_it! src, target
        return unless File.exist? src

        say_status :move, "#{src} -> #{target}"

        FileUtils.mv src, target
      end

      def js_app_path path                
        js_path File.join('app', path)
      end

      def js_path path
        Rails.root.join('app/assets/javascripts', "#{path}.js")
      end

      def emblem?
        options[:emblem]
      end

      def csv?
        options[:csv]
      end

      def extras_notice!
        say extras_notice, :green
      end

      def extras_notice
        %Q{The following extra libs are referenced in this setup: #{extras}
Include these libs, using respective gems (#{gems_list}) or js files.
You can also remove the libs you don't need from the application.js.coffee manifest}        
      end

      def other_gems_notice
        say "Other useful gems: #{other_gems}", :green
      end

      def other_gems
        %q{ember-i18n-rails ember-auth-rails ember-oauth2-rails ember-bootstrap-rails}
      end

      def extras
        %w{ember-data ember-data-validations ember-formBuilder ember-easyForm bootstrap rails.validations.ember}
      end

      def gems_list
        %w{client_side_validations-ember bootstrap-sass ember-rails}
      end
    end
  end
end