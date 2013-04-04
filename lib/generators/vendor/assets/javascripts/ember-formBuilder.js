(function(exports) {
(function() {
  var Bootstrap;

  Bootstrap = Ember.Mixin.create({
    wrapperTag: 'div',
    wrapperClass: 'control-group',
    inputWrapperTag: 'div',
    inputWrapperClass: 'controls',
    labelClass: 'control-label',
    helpTag: 'p',
    helpClass: 'help-block',
    errorTag: 'span',
    errorClass: 'help-inline',
    formClass: '',
    submitClass: 'btn btn-success',
    cancelClass: 'btn btn-danger',
    submitTag: 'button',
    cancelTag: 'a'
  });

  Ember.FormBuilder = Ember.Namespace.create({
    mixins: {
      'bootstrap': Bootstrap
    },
    pushMixin: function(mixin, mixinName) {
      return this.mixins[mixinName] = mixin;
    },
    getMixin: function(mixinName) {
      return this.mixins[mixinName];
    }
  });