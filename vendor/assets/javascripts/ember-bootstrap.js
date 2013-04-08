
(function(exports) {
window.Bootstrap = Ember.Namespace.create();

})({});


(function(exports) {
Bootstrap.Forms = Ember.Namespace.create({

  human: function(value) {
    if (value == undefined)
      return;

    // Replace all _ with spaces
    value = value.replace(/_/, " ");
    // Capitalize the first letter of every word
    value = value.replace(/(^|\s)([a-z])/g, function(m,p1,p2){ return p1+p2.toUpperCase(); });
    return value;
  }
});

})({});


(function(exports) {
Bootstrap.Forms.Field = Ember.View.extend({
  tagName: 'div',
  template: Ember.Handlebars.compile('<div class="control-group">\
    {{view view.labelView}}\
    <div class="controls">\
      {{view view.inputField}}\
      {{view view.errorsView}}\
    </div>\
  </div>'),

  labelView: Ember.View.extend({
    tagName: 'label',
    classNames: ['control-label'],
    template: Ember.Handlebars.compile('{{view.value}}'),

    value: Ember.computed(function(key, value) {
      var parent = this.get('parentView');

      if (value && value != parent.get('label')) {
        parent.set('label', value);
      } else {
        value = parent.get('label');
      }

      return Bootstrap.Forms.human(value);
    }).property('parentView.label'),

    forBinding: 'value',
    attributeBindings: ['for']
  }),

  inputField: Ember.View.extend({
    classNames: ['ember-bootstrap-extend'],
    tagName: 'div',
    template: Ember.Handlebars.compile('This class is not meant to be used directly, but extended.')
  }),

  errorsView: Ember.View.extend({
    tagName: 'div',
    classNames: ['errors', 'help-inline'],

    _updateContent: Ember.observer(function() {
      parent = this.get('parentView');

      if (parent !== null) {
        context = parent.get('bindingContext');
        label = parent.get('label');

        if (context !== null && !context.get('isValid')) {
          errors = context.get('errors');

          if (errors != null && errors[label] !== null) {
            parent.$().find('.control-group').addClass('error')
            this.$().html(errors[label].join(', '));
          } else {
            parent.$().find('.control-group').removeClass('error')
            this.$().html('');
          }
        } else {
          parent.$().find('.control-group').removeClass('error')
          this.$().html('');
        }
      }
    }, 'parentView.bindingContext.isValid', 'parentView.label')
  })
});

})({});


(function(exports) {
Bootstrap.Forms.TextArea = Bootstrap.Forms.Field.extend({

  inputField: Ember.TextArea.extend({
    valueBinding: 'parentView.value',
    nameBinding: 'parentView.label',
    attributeBindings: ['name']
  })
});

})({});


(function(exports) {
Bootstrap.Forms.TextField = Bootstrap.Forms.Field.extend({

  inputField: Ember.TextField.extend({
    valueBinding: 'parentView.value',
    nameBinding: 'parentView.label',
    attributeBindings: ['name']
  })
});

})({});


(function(exports) {
var get = Ember.get;

var modalPaneTemplate = '\
<div class="modal-header"> \
  <a href="#" class="close" rel="close">×</a> \
  {{view view.headerViewClass}} \
</div> \
<div class="modal-body">{{view view.bodyViewClass}}</div> \
<div class="modal-footer"> \
  {{#if view.primary}}<a href="#" class="btn btn-primary" rel="primary">{{view.primary}}</a>{{/if}} \
  {{#if view.secondary}}<a href="#" class="btn btn-secondary" rel="secondary">{{view.secondary}}</a>{{/if}} \
</div>';
var modalPaneBackdrop = '<div class="modal-backdrop"></div>';

Bootstrap.ModalPane = Ember.View.extend({
  classNames: 'modal',
  template: Ember.Handlebars.compile(modalPaneTemplate),
  heading: null,
  message: null,
  primary: null,
  secondary: null,
  showBackdrop: true,
  headerViewClass: Ember.View.extend({
    tagName: 'h3',
    template: Ember.Handlebars.compile('{{view.parentView.heading}}')
  }),
  bodyViewClass: Ember.View.extend({
    tagName: 'p',
    template: Ember.Handlebars.compile('{{{view.parentView.message}}}')
  }),

  didInsertElement: function() {
    if (get(this, 'showBackdrop')) this._appendBackdrop();
    this._setupDocumentKeyHandler();
  },

  willDestroyElement: function() {
    if (this._backdrop) this._backdrop.remove();
    this._removeDocumentKeyHandler();
  },

  keyPress: function(event) {
    if (event.keyCode === 27) {
      this._triggerCallbackAndDestroy({ close: true }, event);
    }
  },

  click: function(event) {
    var target = $(event.target),
        targetRel = target.attr('rel');
    if (targetRel === 'close') {
      this._triggerCallbackAndDestroy({ close: true }, event);
    } else if (targetRel == 'primary') {
      this._triggerCallbackAndDestroy({ primary: true }, event);
    } else if (targetRel == 'secondary') {
      this._triggerCallbackAndDestroy({ secondary: true }, event);
    }
  },

  _appendBackdrop: function() {
    var parentLayer = this.$().parent();
    this._backdrop = $(modalPaneBackdrop).appendTo(parentLayer);
  },

  _setupDocumentKeyHandler: function() {
    var cc = this,
        handler = function(event) {
          cc.keyPress(event);
        };
    jQuery(window.document).bind('keyup', handler);
    this._keyUpHandler = handler;
  },

  _removeDocumentKeyHandler: function() {
    jQuery(window.document).unbind('keyup', this._keyUpHandler);
  },

  _triggerCallbackAndDestroy: function(options, event) {
    if (this.callback) this.callback(options, event);
    this.destroy();
  }
});

Bootstrap.ModalPane.reopenClass({
  popup: function(options) {
    var modalPane;
    if (!options) options = {}
    modalPane = this.create(options);
    modalPane.append();
    return modalPane;
  }
});


})({});


(function(exports) {
var get = Ember.get, getPath = Ember.getPath, set = Ember.set;

Bootstrap.TypeSupport = Ember.Mixin.create({
  baseClassName: Ember.required(String),
  classNameBindings: "typeClass",
  type: null, // success, warning, error, info || inverse
  typeClass: Ember.computed(function() {
    var type = get(this, "type"),
        baseClassName = get(this, "baseClassName");
    return type ? baseClassName + "-" + type : null;
  }).property("type").cacheable()
});

})({});


(function(exports) {
var get = Ember.get;

Bootstrap.AlertMessage = Ember.View.extend(Bootstrap.TypeSupport, {
  classNames: ['alert', 'alert-message'],
  baseClassName: 'alert',
  template: Ember.Handlebars.compile('<a class="close" rel="close" href="#">×</a>{{{message}}}'),
  message: null,
  removeAfter: null,

  didInsertElement: function() {
    var removeAfter = get(this, 'removeAfter');
    if (removeAfter > 0) {
      Ember.run.later(this, 'destroy', removeAfter);
    }
  },

  click: function(event) {
    var target = jQuery(event.target),
        targetRel = target.attr('rel');
    if (targetRel === 'close') {
      this.destroy();
      return false;
    }
  }
});

})({});


(function(exports) {
var get = Ember.get;

Bootstrap.SizeSupport = Ember.Mixin.create({
  baseClassName: Ember.required(String),
  classNameBindings: "sizeClass",
  size: null, // mini, small || large
  sizeClass: Ember.computed(function() {
    var size = get(this, "size"),
        baseClassName = get(this, "baseClassName");
    return size ? baseClassName + "-" + size : null;
  }).property("size").cacheable()
});

})({});


(function(exports) {
var get = Ember.get;

Bootstrap.Button = Ember.Button.extend(Bootstrap.TypeSupport, Bootstrap.SizeSupport, {
  classNames: ['btn'],
  classNameBindings: ['typeClass', 'sizeClass', 'disabled'],

  typeClass: Ember.computed(function() {
    var type = get(this, 'type');
    return type ? 'btn-' + type : null;
  }).property('type').cacheable(),

  sizeClass: Ember.computed(function() {
    var size = get(this, 'size');
    return size ? 'btn-' + size : null;
  }).property('size').cacheable(),

  baseClassName: 'btn'
});

})({});


(function(exports) {
Bootstrap.ButtonGroup = Ember.CollectionView.extend({
  classNames: ['btn-group'],
  itemViewClass: Bootstrap.Button.extend({
    tagName: 'a',
    template: Ember.Handlebars.compile('{{view.content}}')
  })
});

})({});


(function(exports) {
var get = Ember.get;

Bootstrap.ItemViewValueSupport = Ember.Mixin.create({
  value: Ember.computed(function() {
    var parentView = get(this, 'parentView'),
        content, valueKey;
    if (!parentView) return null;
    content = get(this, 'content');
    valueKey = get(parentView, 'itemValueKey');
    if (valueKey) return get(content, valueKey);
    return content;
  }).property('content').cacheable()
});

})({});


(function(exports) {
var get = Ember.get;

Bootstrap.ItemViewTitleSupport = Ember.Mixin.create({
  title: Ember.computed(function() {
    var parentView = get(this, 'parentView'),
        content, titleKey;
    content = get(this, 'content');
    if (parentView) {
      titleKey = get(parentView, 'itemTitleKey');
      if (titleKey) return get(content, titleKey) || content;
    }
    return content;
  }).property('content').cacheable()
});

})({});


(function(exports) {
var get = Ember.get, getPath = Ember.getPath, set = Ember.set;

Bootstrap.ItemSelectionSupport = Ember.Mixin.create(Bootstrap.ItemViewValueSupport, Bootstrap.ItemViewTitleSupport, {
  classNameBindings: ["isActive:active"],
  allowsEmptySelection: false,
  
  isActive: Ember.computed(function() {
    var parentView = get(this, 'parentView'),
        selection, value;
    if (!parentView) return false;
    selection = get(parentView, 'selection');
    value = get(this, 'value');
    return selection === value;
  }).property('parentView.selection', 'value').cacheable(),

  click: function(event) {
    var value = get(this, 'value'),
        parentView = get(this, 'parentView'),
        allowsEmptySelection = get(parentView, 'allowsEmptySelection'),
        selection = get(parentView, 'selection');
    if (allowsEmptySelection === true && selection === value) {
      value = null;
    }
    set(parentView, 'selection', value);
    return false;
  }
});

})({});


(function(exports) {
var get = Ember.get, set = Ember.set;

Bootstrap.RadioButtonGroup = Bootstrap.ButtonGroup.extend({
  selection: null,

  init: function() {
    this._super();
    var content = get(this, 'content');
    if (content && get(this, 'allowsEmptySelection') === false) {
      set(this, 'selection', content.get('firstObject'));
    }
  },

  itemViewClass: Em.View.extend(Bootstrap.ItemSelectionSupport, {
    classNames: 'btn',
    tagName: 'a',
    template: Ember.Handlebars.compile('{{view.title}}')
  })
});


})({});


(function(exports) {
var get = Ember.get, set = Ember.set;

Bootstrap.NavList = Ember.CollectionView.extend({
  classNames: ['nav', 'nav-list'],
  tagName: 'ul',

  itemViewClass: Em.View.extend(Bootstrap.ItemSelectionSupport, {
    template: Ember.Handlebars.compile("<a href='#'>{{view.title}}</a>")
  })
});

})({});


(function(exports) {
Bootstrap.BlockAlertMessage = Bootstrap.AlertMessage.extend({
  classNames: ['alert', 'alert-block']
});

})({});


(function(exports) {
Bootstrap.PillItem = Ember.View.extend(Bootstrap.ItemSelectionSupport, {
  template: Ember.Handlebars.compile('<a href="#">{{title}}</a>')
});

})({});


(function(exports) {
Bootstrap.Pills = Ember.CollectionView.extend({
  classNames: ['nav', 'nav-pills'],
  classNameBindings: ['isStacked:nav-stacked'],
  tagName: 'ul',
  itemViewClass: Bootstrap.PillItem,
  selection: null
});

})({});


(function(exports) {
Bootstrap.Tabs = Ember.CollectionView.extend({
  classNames: ['nav', 'nav-tabs'],
  classNameBindings: ['isStacked:nav-stacked'],
  tagName: 'ul',
  itemViewClass: Bootstrap.PillItem,
  selection: null
});

})({});


(function(exports) {
var get = Ember.get;

Bootstrap.ProgressBar = Ember.View.extend({
  classNames: ['progress'],
  classNameBindings: ['isStriped:progress-striped', 'isAnimated:active'],
  template: Ember.Handlebars.compile('<div class="bar" {{bindAttr style="style"}}></div>'),
  isAnimated: false,
  isStriped: false,
  progress: 0,

  style: Ember.computed(function() {
    var progress = get(this, 'progress');
    return "width:" + progress + "%;";
  }).property('progress').cacheable()
});

})({});


(function(exports) {
Bootstrap.Badge = Ember.View.extend(Bootstrap.TypeSupport, {
  tagName: "span",
  classNames: "badge",
  baseClassName: "badge",
  template: Ember.Handlebars.compile("{{content}}")
});

})({});


(function(exports) {
Bootstrap.Label = Ember.View.extend(Bootstrap.TypeSupport, {
  tagName: "span",
  classNames: "label",
  baseClassName: "label",
  template: Ember.Handlebars.compile("{{content}}")
});

})({});


(function(exports) {
var get = Ember.get;

Bootstrap.Well = Ember.View.extend({
  template: Ember.Handlebars.compile('{{content}}'),
  classNames: 'well',
  content: null
});

})({});


(function(exports) {
var get = Ember.get;

Bootstrap.ItemViewHrefSupport = Ember.Mixin.create({
  href: Ember.computed(function() {
    var parentView = get(this, 'parentView'),
        content, hrefKey;
    content = get(this, 'content');
    if (parentView) {
      hrefKey = get(parentView, 'itemHrefKey');
      if (hrefKey) return get(content, hrefKey) || "#";
    }
    return content;
  }).property('content').cacheable()
});

})({});


(function(exports) {
var get = Ember.get, set = Ember.set, A = Ember.A;

Bootstrap.Pagination = Ember.View.extend({
  childViews: ["contentView"],
  classNames: "pagination",
  template: Ember.Handlebars.compile('{{view contentView}}'), // Using ContainerView as not working
  itemTitleKey: "title",
  itemHrefKey: "href",
  itemValueKey: "value",
  init: function() {
    this._super();
    if (!this.get("content")) {
      this.set("content", A([]));
    }
  },
  contentView: Ember.CollectionView.extend({
    tagName: "ul",
    contentBinding: "parentView.content",
    selectionBinding: "parentView.selection",
    itemTitleKeyBinding: "parentView.itemTitleKey",
    itemHrefKeyBinding: "parentView.itemHrefKey",
    itemValueKeyBinding: "parentView.itemValueKey",
    itemViewClass: Ember.View.extend(Bootstrap.ItemSelectionSupport, Bootstrap.ItemViewHrefSupport, {
      classNameBindings: ["content.disabled"],
      template: Ember.Handlebars.compile('<a {{bindAttr href="href"}}>{{title}}</a>')
    })
  })
});

})({});


(function(exports) {
Bootstrap.Pager = Ember.CollectionView.extend({
  tagName: "ul",
  classNames: "pager",
  itemTitleKey: "title",
  itemHrefKey: "href",
  init: function() {
    this._super();
    if (!this.get("content")) {
      this.set("content", Ember.A([
        Ember.Object.create({ title: "&larr;" }), 
        Ember.Object.create({ title: "&rarr;" })
      ]));
    }
  },
  itemViewClass: Ember.View.extend(Bootstrap.ItemViewTitleSupport, Bootstrap.ItemViewHrefSupport, {
    classNameBindings: ["content.next", "content.previous", "content.disabled"],
    template: Ember.Handlebars.compile('<a {{bindAttr href="href"}}>{{title}}</a>')
  }),
  arrayDidChange: function(content, start, removed, added) {
    if (content) {
      ember_assert("content must always has at the most 2 elements", content.get("length") <= 2);
    }
    return this._super(content, start, removed, added);
  }
});

})({});


(function(exports) {
var get = Ember.get;

Bootstrap.FirstLastViewSupport = Ember.Mixin.create({
  createChildView: function(view, attrs) {
    if (attrs) {
      var content = get(this, "content");
      if (attrs.contentIndex === 0) {
        view = get(this, "firstItemViewClass") || view;
      }
      if (attrs.contentIndex === (content.get("length") - 1)) {
        view = get(this, "lastItemViewClass") || view;
      }
    }
    return this._super(view, attrs);
  }
});

})({});


(function(exports) {
var get = Ember.get;

Bootstrap.Breadcrumb = Ember.CollectionView.extend(Bootstrap.FirstLastViewSupport, {
  tagName: "ul",
  classNames: "breadcrumb",
  divider: "/",
  itemViewClass: Ember.View.extend(Bootstrap.ItemViewTitleSupport, {
    template: Ember.Handlebars.compile('<a href="#">{{title}}</a><span class="divider">{{parentView.divider}}</span>')
  }),
  lastItemViewClass: Ember.View.extend(Bootstrap.ItemViewTitleSupport, {
    classNames: "active",
    template: Ember.Handlebars.compile("{{title}}")
  })
});

})({});


(function(exports) {
})({});
