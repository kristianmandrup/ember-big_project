require 'generators/ember_proj/gem_helper'
require 'fileutils'

module EmberProj
  module Generators
    class BootstrapGenerator < Rails::Generators::Base
      class_option :csv, type: :boolean, default: false,
                   desc: 'Add client side validations integration'

      class_option :emblem, type: :boolean, default: false,
                   desc: 'Use Emblem templates (like slim)'

      class_option :auth, type: :array, default: [],
                   desc: 'Authentication libraries to use (oauth2, auth)'

      class_option :bundle, type: :boolean, default: false,
                   desc: 'Do not bundle gems unless absolutely required!'

      TPL_PATH = File.expand_path('../templates', __FILE__)

      source_root TPL_PATH

      def skeleton
        directory "app", "app/assets/javascripts/app", recursive: true

        app_directories.each do |app_dir|
          src = "app/#{app_dir}"
          target = "app/assets/javascripts/app/#{app_dir}"

          directory src, target, recursive: true

          sub_dirs.each do |sub_dir|
            sub_src = File.join(src, sub_dir)

            full_sub_path = File.join(TPL_PATH, sub_src)

            if File.directory? full_sub_path
              sub_target = File.join(target, sub_dir)
              directory sub_src, sub_target, recursive: true 
            end
          end
        end

        copy_file "application.js.coffee", (js_path(application) + '.coffee')
      end

      def move_ember_files
        say "Moving existing ember files...", :green
        move_to_app 'views/application_view', 'controllers/application_controller'
        move 'store', 'app/stores/store'
        move 'router', 'app/routes/router'

        # remove default application.js file 
        # replaced by coffee version supplied by this gem!
        say "Cleanup...", :green

        if File.exist? Rails.root.join js_path('.js/.coffee')
          # Somehow I can't seem to get rid of this file!!!
          remove_file js_path('.js/.coffee')
        end

        if File.exist? Rails.root.join js_path('.js/.coffee')
          # remove old application.js manifest
          remove_file js_path('application')
        end
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
        if csv?
          bundle_gems!
          invoke "client_side_validations:ember:install" 
        else
          bundle_gems! if bundle?
        end
      end        

      def notices
        draw_border :thick
        auth_notices!
        extras_notice!
        other_gems_notice!
      end

      protected

      include EmberProj::GemHelper

      def sub_dirs
        %w{locales mixins extensions shortcuts}
      end

      def bundle?
        options[:bundle]
      end

      # TODO: allow customization - which to include/exclude!
      def app_directories
        %w{authentication config controllers helpers lib mixins models routes state_managers stores templates views}
      end

      attr_reader :auth_notices

      def auth_notices!
        if auth_notices.empty?
          say "Authentication: was not configured", :green
          return
        end

        say "Authentication:", :green
        say auth_notices.join("\n"), :green
        say ""
      end

      def auth_notices
        @auth_notices ||= []
      end

      def auth_notice name
        auth_notices << "See: #{auth_repo name} for authentication configuration details"
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
        return if options[:auth].blank?

        if use_auth_gems.empty?
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

      def move_to_app *paths
        paths.flatten.each do |path|
          move_it! js_path(path), js_app_path(path)
        end
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

      def strip_front path
        "app/assets" + path.to_s.split(/app\/assets/)[1]
      end

      def js_app_path path                
        js_path File.join('app', path)
      end

      def js_path path
        path = "#{path}.js" unless path =~ /\.js$/
        Rails.root.join('app/assets/javascripts', path)
      end

      def emblem?
        options[:emblem]
      end

      def csv?
        options[:csv]
      end

      def extras_notice!
        draw_border
        say extras_notice, :green
      end

      def extras_notice
        %Q{The following extra libs are referenced in this setup: 

  #{join extras}

Include these libs, using respective gems (#{join gems_list}) or the equivalent js files.

Note: You can also remove the libs you don't need from the application.js.coffee manifest
}        
      end

      def draw_border type = :thin
        say border(type), :green
      end

      def nice text
        border + text
      end

      def border type = :thin
        border_char(type) * border_width + "\n"
      end      

      def border_char type
        type == :thick ? "=" : '-'
      end

      def border_width
        80
      end

      def join list
        list.join ', '
      end

      def other_gems_notice!
        draw_border
        say other_gems_notice, :green
      end

      def other_gems_notice
        "Other useful gems: #{other_gems}\n"
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