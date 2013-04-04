// Last commit: 16f3486 (2013-03-04 21:19:48 -0500)


(function() {
Ember.EasyForm = Ember.Namespace.create({
  VERSION: '0.3.0'
});

})();



(function() {
Ember.Handlebars.registerHelper('errorField', function(property, options) {
  if (this.get('errors')) {
    options.hash.property = property;
    return Ember.Handlebars.helpers.view.call(this, Ember.EasyForm.Error, options);
  }
});

})();



(function() {
Ember.Handlebars.registerBoundHelper('formFor', function(object, options) {
  return Ember.Handlebars.helpers.view.call(object, Ember.EasyForm.Form, options);
});

})();



(function() {
Ember.Handlebars.registerHelper('input', function(property, options) {
  options.hash.inputOptions = Ember.copy(options.hash);
  options.hash.property = property;
  options.hash.isBlock = !!(options.fn);
  return Ember.Handlebars.helpers.view.call(this, Ember.EasyForm.Input, options);
});

})();



(function() {
Ember.Handlebars.registerHelper('inputField', function(property, options) {
  var context = this,
      propertyType = function(property) {
    try {
      return context.constructor.metaForProperty(property);
    } catch(e) {
      return null;
    }
  };

  options.hash.valueBinding = property;

  if (options.hash.as === 'text') {
    return Ember.Handlebars.helpers.view.call(context, Ember.TextArea, options);
  } else {
    if (!options.hash.type) {
      if (property.match(/password/)) {
        options.hash.type = 'password';
      } else if (property.match(/email/)) {
        options.hash.type = 'email';
      } else {
        if (propertyType(context, property) === 'number' || typeof(context.get(property)) === 'number') {
          options.hash.type = 'number';
        } else if (propertyType(context, property) === 'date' || (context.get(property) !== undefined && context.get(property).constructor === Date)) {
          options.hash.type = 'date';
        }
      }
    }
    return Ember.Handlebars.helpers.view.call(context, Ember.TextField, options);
  }
});

})();



(function() {
Ember.Handlebars.registerHelper('labelField', function(property, options) {
  options.hash.property = property;
  return Ember.Handlebars.helpers.view.call(this, Ember.EasyForm.Label, options);
});

})();



(function() {
Ember.Handlebars.registerHelper('submit', function(value, options) {
  if (typeof(value) === 'object') {
    options = value;
    value = undefined;
  }
  options.hash.context = this;
  options.hash.value = value || 'Submit';
  return Ember.Handlebars.helpers.view.call(this, Ember.EasyForm.Submit, options);
});

})();



(function() {

})();



(function() {
Ember.EasyForm.Error = Ember.View.extend({
  tagName: 'span',
  classNames: ['error'],
  init: function() {
    var watchFunc;
    this._super();

    // TODO: un-fuglify this
    watchFunc = {};
    watchFunc[''+this.property+'Watch'] = function() {
      if (typeof(this.get('controller.errors.'+this.property)) === 'string') {
        return (this.get('controller.errors.'+this.property));
      } else {
        return (this.get('controller.errors.'+this.property) || [])[0];
      }
    }.property('controller.content.errors.'+this.property);
    this.reopen(watchFunc);

    this.set('template', Ember.Handlebars.compile('{{view.'+this.property+'Watch}}'));
  }
});

})();



(function() {
Ember.EasyForm.Form = Ember.View.extend({
  tagName: 'form',
  attributeBindings: ['novalidate'],
  novalidate: 'novalidate',
  submit: function(event) {
    var object = this.get('context').get('content'), _this = this;

    if (event) {
      event.preventDefault();
    }

    if (object.validate === undefined) {
      this.get('controller').send('submit');
    } else {
      object.validate().then(function() {
        if (object.get('isValid') === true) {
          _this.get('controller').send('submit');
        }
      });
    }
  }
});

})();



(function() {
Ember.EasyForm.Input = Ember.View.extend({
  init: function() {
    this._super();
    if (!this.isBlock) {
      this.set('template', Ember.Handlebars.compile(this.fieldsForInput()));
    }
    if(this.get('context').get('errors') !== undefined) {
      this.reopen({
        error: function() {
          return this.get('context').get('errors').get(this.property) !== undefined;
        }.property('context.errors.'+this.property)
      });
    }
  },
  tagName: 'div',
  classNames: ['input', 'string'],
  classNameBindings: ['error:fieldWithErrors'],
  fieldsForInput: function() {
    return this.labelField()+this.inputField()+this.errorField();
  },
  labelField: function() {
    var options = this.label ? 'text="'+this.label+'"' : '';
    return '{{labelField '+this.property+' '+options+'}}';
  },
  inputField: function() {
    var options = '', key, inputOptions = ['type', 'placeholder'];
    for (var i = 0; i < inputOptions.length; i++) {
      key = inputOptions[i];
      if (this[key]) {
        if (typeof(this[key]) === 'boolean') {
          this[key] = key;
        }
        options = options.concat(''+key+'="'+this[inputOptions[i]]+'"');
      }
    }

    options.replace(/^\s\s*/, '').replace(/\s\s*$/, '');

    return '{{inputField '+this.property+' '+options+'}}';
  },
  errorField: function() {
    var options = '';
    return '{{errorField '+this.property+' '+options+'}}';
  },
  focusOut: function() {
    if (this.get('context').get('content').validate) {
      this.get('context').get('content').validate(this.property);
    }
  }
});

})();



(function() {
Ember.EasyForm.Label = Ember.View.extend({
  tagName: 'label',
  init: function() {
    this.set('template', this.renderText());
  },
  renderText: function() {
    return Ember.Handlebars.compile(this.text || this.property.underscore().split('_').join(' ').capitalize());
  }
});

})();



(function() {
Ember.EasyForm.Submit = Ember.View.extend({
  tagName: 'input',
  attributeBindings: ['type', 'value'],
  type: 'submit',
  init: function() {
    this.set('value', this.value);
  },
  onClick: function() {
    if (this.get('context').validate()) {
      this.get('controller').send('submit');
    }
  }
});

})();



(function() {

})();



(function() {
Ember.TEMPLATES['easyForm/input'] = Ember.Handlebars.compile('<label {{bindAttr for="labelFor"}}>{{labelText}}</label>');

})();



(function() {

})();



(function() {
Ember.EasyForm.objectNameFor = function(object) {
  var constructorArray = object.constructor.toString().split('.');
  return constructorArray[constructorArray.length - 1].underscore();
};

})();



(function() {

})();
