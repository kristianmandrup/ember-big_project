(function() {
/**
  Default namespace. Here's where you'll find everything related
  to ember-forms.
*/
window.EF = Ember.Namespace.create({

  /**
    Will find the container form recursively through the view hierarchy. Since
    forms cannot contain other forms (http://www.w3.org/TR/xhtml1/#prohibitions)
    this will resolve to a single EF.Form or undefined otherwise.

    @type EF.Form
  */
  findFormRecursively: function(view){
    var currentView = view;
    do{
      if(currentView.get('isForm') === true){ return currentView; }
    }while(currentView = view.get('parentView'));
  },

  /**
    Will find the first EF.BaseField in line looking recursively through the
    view hierarchy.

    @type EF.BaseField
  */
  findFieldRecursively: function(view){
    var currentView = view;
    do{
      if(currentView.get('isField') === true){ return currentView; }
    }while(currentView = view.get('parentView'));
  },

  /**
    Returns a field class given a particular name. For example, 
    `findField("text")` will return `EF.TextField`.

    @type String
  */
  findField: function(name){
    name = name || 'text';
    var fieldName = Ember.String.camelize(name);
    fieldName = fieldName.replace(/^./, fieldName[0].toUpperCase());
    fieldName = fieldName + 'Field';
    var field = EF[fieldName];
    if(field){
      return field;
    }else{
      throw 'Field ' + name + ' cannot be found';
    }
  }
});

})();



(function() {
EF.Labels = Ember.Object.create({
  months: Ember.A(["January", "February", "March", "April", "May",
    "June", "July", "August", "September", "October", "November", 
    "December"]),
  dayPrompt: '- Day -',
  monthPrompt: '- Month -',
  yearPrompt: '- Year -',
});

})();



(function() {
var fmt = Ember.String.fmt;

/**
  `Ember.Select` is meant to be bound to collections with a changing nature, 
  but with big collections, it comes with a big performance penalty. In order
  to address this issue, we've created a "static" one - meaning that won't
  change as the associated collection changes. This makes it perfect for things
  like date selectors, gender, numerical...

  The collection can be an array of values, or an array of Javascript objects
  with `value` and `label` keys.
*/
EF.UnboundSelect = Ember.View.extend({
  tagName: 'select',
  template: Ember.Handlebars.compile("{{unbound view.options}}"),

  /**
    @private

    Renders the options from the collection.
  */
  options: Ember.computed(function(){
    var output;
    if(!Ember.isEmpty(this.get('prompt'))){
      output = '<option value="">' + this.get('prompt') + '</option>';
    }
    this.get('content').forEach(function(item){
      var value, label;
      if(!Ember.isEmpty(item.value)){
        value = item.value;
        label = item.label;
      }else{ value = item; label = item; }
      var selected = "";
      if(value === this.get('value')){
        selected = ' selected="selected"';
      }
      output += fmt('<option value="' + value + '"' + selected + '>' + label + '</option>');
    }, this);
    return (new Handlebars.SafeString(output));
  }).property('value'),

  setValue: Ember.observer(function(){
    if(!this.$()) return;
    var value = this.get('value');
    var option = this.$('option[value=' + value + ']');
    option.siblings().attr('selected', null);
    option.attr('selected', 'selected');
  }, 'value'),

  didInsertElement: function(){
    var view = this;
    this.$().change(function(){
      view.change();
    });
  },

  change: function(){
    var value = this.$().val();
    this.set('value', value);
  }
});

})();



(function() {

})();



(function() {
var findFieldRecursively = EF.findFieldRecursively,
    findFormRecursively  = EF.findFormRecursively;

/**
  @class
  @private

  Represents an input's label. Depends on the following attributes:

  * name: The label name. Will fallback to the raw field name

  @extends Ember.View
*/
EF.Label = Ember.View.extend({
  tagName: 'label',
  attributeBindings: ['for'],
  template: Ember.Handlebars.compile("{{view.name}}"),
  field: Ember.computed(function(){ return findFieldRecursively(this); }),
  form: Ember.computed(function(){ return this.get('field.formView'); }),
  name: Ember.computed(function(){
    return this.get('field.label') || this.get('field.name');
  }),
  didInsertElement: function(){
    // We bind it here to avoid re-rendering before the element was inserted
    Ember.bind(this, 'for', 'component.inputView.elementId');
  }
});

})();



(function() {
var findFormRecursively = EF.findFormRecursively;

EF.BaseField = Ember.ContainerView.extend({
  name: null,
  formView: null,
  tagName: 'div',
  classNames: ['input'],
  InputView: null,
  value: null,
  isField: true,

  setFormView: function(){
    var parentView, formView;

    if(parentView = this.get('parentView')){
      formView = findFormRecursively(parentView);
    }
    if(formView){
      formView.get('fieldViews').pushObject(this);
      this.set('formView', formView);
      this.set('content', formView.get('content'));
    }
  },

  bindValue: function(){
    var name = this.get('name');
    var path = 'content.' + name;
    var value = this.get(path);
    this.set('value', this.get(path));
  },

  data: Ember.computed(function(){
    var data = {};
    data[this.get('name')] = this.get('inputView.value');
    return data;
  }).volatile(),

  init: function(){
    this._super();
    var labelView = EF.Label.create(),
        inputView = this.get('InputView').create({
          field: this,
          valueBinding: 'field.value',
          name: this.get('name'),
          placeholder: this.get('placeholder')
        });
    
    this.set('labelView', labelView);
    this.set('inputView', inputView);
    this.pushObject(labelView);
    this.pushObject(inputView);
    this.setFormView();
    this.bindValue();
  }
});

})();



(function() {
EF.TextField = EF.BaseField.extend({
  InputView: Ember.TextField.extend({
    attributeBindings: ['name', 'placeholder']
  })
});

})();



(function() {
EF.TextareaField = EF.BaseField.extend({
  InputView: Ember.TextArea
});

})();



(function() {
EF.SelectField = EF.BaseField.extend({
  InputView: Ember.Select.extend({
    init: function(){
      var labelPath = this.get('field.optionLabelPath'),
          promptValue = this.get('field.prompt'),
          valuePath = this.get('field.optionValuePath');

      if(labelPath){ this.set('optionLabelPath', 'content.' + labelPath); }
      if(valuePath){ this.set('optionValuePath', 'content.' + valuePath); }
      if(promptValue){ this.set('prompt', this.get('field.prompt')); }

      this._super();
    },
    content: Ember.computed(function(){
      return this.get('field.content') || Ember.A([]);
    }).property('field.content')
  })
});

})();



(function() {
var e = Ember.isEmpty;

EF.DateComponent = Ember.ContainerView.extend({
  childViews: ['dayView', 'monthView', 'yearView'],
  tagName: 'span',
  classNames: ['date'],

  value: Ember.computed(function(key, value){
    var day, month, year;
    if (arguments.length === 1){
      day   = this.get('dayView.value');
      month = this.get('monthView.value');
      year = this.get('yearView.value');
      if(!e(day) && !e(month) && !e(year)){
        return new Date(year, month, day, 12, 0, 0);
      }
    }else if(value){
      day = value.getDate() + '';
      month = value.getMonth() + '';
      year = value.getFullYear() + '';
      this.set('dayView.value', day);
      this.set('monthView.value', month);
      this.set('yearView.value', year);
    }
    return value;
  }).property('dayView.value', 'monthView.value', 'yearView.value'),

  dayView: EF.UnboundSelect.extend({
    attributeBindings: ['name'],
    name: Ember.computed(function(){
      return this.get('parentView').get('name') + '_day';
    }),
    promptBinding: 'EF.Labels.dayPrompt',
    content: Ember.computed(function(){
      var days = [];
      for(var i=1; i<=31; i++){
        days.push(i + '');
      }
      return Ember.A(days);
    })
  }),

  monthView: EF.UnboundSelect.extend({
    promptBinding: 'EF.Labels.monthPrompt',
    attributeBindings: ['name'],
    name: Ember.computed(function(){
      return this.get('parentView').get('name') + '_month';
    }),
    content: Ember.computed(function(){
      var months = EF.Labels.get('months');
      return months.map(function(month, index){
        return {value: (index + ''), label: month};
      });
    })
  }),

  yearView: EF.UnboundSelect.extend({
    promptBinding: 'EF.Labels.yearPrompt',
    attributeBindings: ['name'],
    name: Ember.computed(function(){
      return this.get('parentView').get('name') + '_year';
    }),
    startYear: function(){
      return this.get('parentView.parentView.startYear') || new Date().getFullYear();
    },
    endYear: function(){
      return this.get('parentView.parentView.endYear') || (this.startYear() - 100);
    },
    content: Ember.computed(function(){
      var years = [];
      for(var i=this.startYear(); i>=this.endYear(); i--){
        years.push(i + "");
      }
      return Ember.A(years);
    })
  })
});

EF.DateField = EF.BaseField.extend({
  InputView: EF.DateComponent.extend({
    init: function(){
      this._super();
    },
  }),
  value: Ember.computed(function(key, value){
    if(arguments.length === 1){
      return this.get('inputView.value');
    }else{
      this.set('inputView.value', value);
      return value;
    }
  })
});

})();



(function() {
EF.PasswordField = EF.BaseField.extend({
  InputView: Ember.TextField.extend({
    attributeBindings: ['name', 'placeholder'],
    type: 'password'
  })
});

})();



(function() {

})();



(function() {
/**
  @class

  EF.Form is a view that contains several fields and can respond to its events,
  providing the field's normalized data. 
  
  It will automatically bind to the values of an object, if provided.

    myForm = EF.Form.create({
      objectBinding: 'App.someObject',
      template: Ember.Handlebars.compile(
        '{{field title }}' +
        '{{field body as="textarea"}}' +
        '{{form buttons}}'
      ),
      save: function(data){ this.get('object').setProperties(data); }
    });

  @extends Ember.View
*/
EF.Form = Ember.View.extend({
  tagName: 'form',
  classNameBindings: ['name'],
  classNames: ['ember-form'],
  attributeBindings: ['action'],
  fieldViews: Ember.A(),
  buttons: ['submit'],
  content: null,
  isForm: true,
  submitName: 'Save',
  name: Ember.computed(function(){
    var constructor = this.get('content.constructor');
    if(constructor && constructor.isClass){
      var className = constructor.toString().split('.').pop();
      return Ember.String.decamelize(className);
    }
  }).property('content'),

  /**
    It returns this form fields data in an object.

      myForm.data();

    Would return:

      {
        title: 'Some post title',
        content: 'The post content'
      }
  */
  data: Ember.computed(function(){
    var data = {};
    this.get('fieldViews').forEach(function(field){
      var fieldData = field.get('data');
      for(var key in fieldData){
        data[key] = fieldData[key];
      }
    });
    return data;
  }).volatile(),

  submit: function(){
    this.save(this.get('data'));
    return false;
  },

  /**
    This event will be fired when the form is sent, and will receive the form
    data as argument. Override it to perform some operation like setting the
    properties of an object.

    myForm = EF.Form.create({
      [...]
      save: function(data){
        this.get('object').setProperties(data);
      }
    });
  */
  save: function(data){ }
});

})();



(function() {
var findFormRecursively  = EF.findFormRecursively;

/**
 @class
 Represents a submit button.

 * name: The button text
*/
EF.SubmitButton = Ember.View.extend({
  tagName: 'button',
  attributeBindings: ['type'],
  type: 'submit',
  name: Ember.computed(function(){ return this.get('parentView.submitName'); }),
  template: Ember.Handlebars.compile("{{view.name}}")
});

EF.Buttons = Ember.ContainerView.extend({
  classNames: ['buttons'],
  childViews: [EF.SubmitButton],
  form: Ember.computed(function(){ return findFormRecursively(this); }),
  submitName: Ember.computed(function(){ return this.get('form.submitName'); })
});

})();



(function() {
var findFormRecursively = EF.findFormRecursively,
    findField = EF.findField;

EF.ButtonHelper = Ember.Object.create({
  helper: function(view, options){
    var buttonView = EF.Buttons;
    var currentView = options.data.view;
    currentView.appendChild(buttonView, options.hash);
  }
});

/**
  A helper to be used in a handlebars template. Will generate a submit button
  that intented to trigger the form submission. Usage:

     {{ form buttons }}

  It accepts the following options:

  * name: The button's text
*/
Ember.Handlebars.registerHelper('form', function(name, options){
  if(name === 'buttons'){
    EF.ButtonHelper.helper(this, options);
  }else{
    throw "Unknown " + name + " in form helper";
  }
});

})();



(function() {
var findFormRecursively = EF.findFormRecursively,
    findField = EF.findField;

EF.FieldHelper = Ember.Object.create({
  helper: function(view, name, options){
    var optionsHash = options.hash,
        type = optionsHash.as,
        currentView = options.data.view,
        fieldView = findField(type);

    if(Ember.isEmpty(optionsHash.name)){ optionsHash.name = name; }
    delete(optionsHash.as);
    currentView.appendChild(fieldView, optionsHash);
  }
});

/**
  A handlebars helper that will render a field with its input and label.

     {{ field name }}

  It accepts the following options:

  * as: The field type. Defaults to `text`. Can be `text`, `textarea` and
    `select`.

  Any other options will be passed to the particular field instance and may
  modify its behavior.
*/
Ember.Handlebars.registerHelper('field', function(name, options){
  EF.FieldHelper.helper(this, name, options);
});

})();



(function() {

})();



(function() {

})();

