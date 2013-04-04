# Ember BigProject

Create a sensible and extensible Ember project structure for big projects ;)

## Installation

Add this line to your application's Gemfile:

    gem 'ember-big_project'

And then execute:

    $ bundle

Or install it yourself as:

    $ gem install ember-big_project

## Usage

*Important!!*

This bootstrap generators expects that you have set up your Ember project using `ember:bootstrap` or similar generator. Before you execute `ember_proj:bootstrap`, please make sure you have comitted you project to version control, so you go revert in case you need to.

Command:

    $ rails g ember_proj:bootstrap

Help!? (see list of options available):

    $ rails g ember_proj:bootstrap --help

Example: add ember-auth basic authentication and emblem templating ;)

    $ rails g ember_proj:bootstrap --auth ember-auth --emblem

## Ember app structure

Proposed (recommended) app structure for large Ember app.

```
  - application.js

  + app
    - app_loader.js
    + authentication
      + mixins  

    + config
      + locales
      - app.js
      - locale.js
      - logging.js
      - display.js

    + controllers
      + _mixins
      + users
        - user_controller
        - users_controller
      - session_controller

    + helpers
    + lib  
    + mixins

    + models
      + extensions
      + mixins  
      - user.js  

    + views
      + extensions
      + mixins
      - new_user_view.js
      - user_view.js
      - users_view.js

    + routes
      + helpers
      + mixins
      + shortcuts
      - user_router.js
      - index_router.js

    + state_managers
    + templates
    - authentication.js
    - config.js
    - controllers.js
    - helpers.js
    - lib.js
    - mixins.js
    - models.js
    - views.js
    - routes.js
    - state_managers.js
    - templates.js
```

## application.js

```coffeescript
# application.js

#= require modernizr
#= require jquery
#= require handlebars
#= require ruby
#= require ember
#= require ember-data
#= require ember-data-validations
#= require ember-formBuilder
#= require bootstrap

#= require app/app_loader

#= require rails.validations
#= require rails.validations.ember

window.App = Ember.Application.create LOG_TRANSITIONS: true

# Defer App readiness until it should be advanced for either
# testing or production.
App.deferReadiness()

```

## app/app_loader.js

Responsible for loading all the Ember app files

```coffeescript
# app/app_loader_.js

#= require_self

#= require_tree lib
#= require_tree mixins
#= require_tree helpers
#= require_tree config

#= require store
#= require models
#= require controllers
#= require views

#= require state_managers
#= require authentication
#= require routes

```

## Index files

Use index files such as `models.js` to quickly change the load order of files or add/remove files to be included in the app ;)

You will likley have specific mixins for models, that should be loaded before the models they are mixed into - the reason for this pattern.

You can then make custom extensions to your models, after they have applied whatever mixins they need or directly extend built-in Ember classes ;)

Example:

```coffeescript
# models.js
#= require_tree models/mixins
#= require_tree models
#= require_tree models/extensions
```

## Test setup

For easy test setup of your project, you can use the generators supplied by the [ember-konacha-rails](https://github.com/kristianmandrup/ember-konacha-rails) gem. 

The `ember_proj:boostrap` generator has a `--konacha` option, which when included will setup the project with a default konacha setup. To customize this test setup run the `ember_konacha:install` generator with specific options.


## Basics included

An `App.Authentication` class with a `alwaysSendCsrfToken` method (see http://blog.waymondo.com/2012-12-18-ember-dot-js-and-rails-authentication-gotchas/).

To add CSRF token protection, simply add the following:

```coffeescript
$ ->
  App.Authentication.alwaysSendCsrfToken
```

For [sorcery](https://github.com/NoamB/sorcery) rails auth integration:

```ruby
# config/initializers/sorcery.rb

Rails.application.config.sorcery.configure do |config|
  user.remember_me_httponly = false
end
```

## Conventions

All coffeescript files follow the ruby filename convention with underscore for readability :)

All folders have a dedicated object, f.ex for the `routes` the object `App.Routes`, an Ember object that can contain aggregation information or shared functionality (including mixins etc.) for routes.

All mixins should be postfixed with `Mix`

```coffeescript
App.Routes.RedirectGuestMix = Ember.Mixin.create
  myMixingMethod: ->
    console.log 'hello'
```

Extensions may be postfixed with `Ext` to clearly indicate it is an extension (if it makes sense).

```coffeescript
App.Models.CoolModelExt = DS.Model.extend
  coolnessFactor: 0
  myCool: ->
    console.log "Awesome cool #{@coolnessFactor} :)"
```

Also see this article: http://techiferous.com/2012/05/experimenting-with-the-architecture-of-ember-js/ on how to scale the architecture for big Ember projects.

## Vendor libs included

These vendor libs can be required directly in your `application.js.coffee`. 

Alternatively create a `vendor.js.coffee` which you require from `application.js.coffee`. 

Note: Some vendor libs will need to be required after `require app/app_loader`, if they hook into the Application classes you have defined (f.ex `rails.validations.ember` lib).

* [ember-forms](https://github.com/codegram/ember-forms)
* [ember-formbuilder](https://github.com/luan/ember-formbuilder)
* [ember-easyForm](https://github.com/dockyard/ember-easyForm)
* [ember-validations](https://github.com/dockyard/ember-validations)
* [ember-data-validations](https://github.com/Myslik/ember-data-validations)

See also: [formBuilder](http://luansantos.com/2012/03/19/introducing-ember-formbuilder/)

lib distros (pre-compiled):

* [validations](https://github.com/dockyard/ember-builds/tree/master/validations)
* [easyForm](https://github.com/dockyard/ember-builds/tree/master/easyForm)

If you find one or more of these vendor libs are outdated, please make a patch with the updated lib and send me a pull request! Thanks :)

Also let me know of other vendor libs/tools that you think would make a useful addition!

Check out [ember-tools](https://github.com/rpflorence/ember-tools) for more tools and scaffold generators!!

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request
