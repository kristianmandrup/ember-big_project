#= require modernizr
#= require jquery
#= require handlebars
#= require ruby
#= require ember
#= require ember-data
#= require ember-data-validations
#= require ember-formBuilder
#= require bootstrap

#= require app/_loader_

#= require rails.validations
#= require rails.validations.ember

window.App = Ember.Application.create LOG_TRANSITIONS: true

# Defer App readiness until it should be advanced for either
# testing or production.
App.deferReadiness()
