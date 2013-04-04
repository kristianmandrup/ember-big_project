# From http://blog.waymondo.com/2012-12-18-ember-dot-js-and-rails-authentication-gotchas/
App.Router.RedirectGuest = Ember.Mixin.create
  setup: ->
    beforeFilterRedirection = Em.get(@, 'beforeFilterRedirection')
    if beforeFilterRedirection? and (redirection = beforeFilterRedirection())?
      @router.transitionTo redirection
    else
      @connectOutlets.apply(@, arguments)