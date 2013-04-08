// http://stackoverflow.com/questions/15077903/ember-js-rc1-register-and-inject
App.Logger = Ember.Object.extend({
  log: function(message) {
    console.log(message);
  }
});

App.register('logger:main', App.Logger);
App.inject('model', 'logger', 'logger:main');
App.inject('view', 'logger', 'logger:main');
App.inject('controller', 'logger', 'logger:main');