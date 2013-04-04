var get = Ember.get;

DS.DefaultValidators = {
    required: function (value, meta) {
        if (meta.options.required == true) {
            if (!value || 0 === value.length) {
                return "'%@' attribute is required".fmt(meta.name);
            }
        } else return '';
    }
};

DS.Validation = Ember.Object.create({
    init: function () {
        var defaults = DS.DefaultValidators;
        this.validators = [];
        for (var validator in defaults) {
            if (defaults.hasOwnProperty(validator)) {
                this.validators.push(defaults[validator]);
            }
        }
    },
    register: function (validator) {
        this.validators.push(validator);
    },
    validate: function (value, meta) {
        var length = this.validators.length;
        for (var i = 0; i < length; i++) {
            var validator = this.validators[i];
            var error = validator(value, meta);
            if (error) return error;
        }
        return '';
    }
});

DS.Model.reopen({
    staleValidation: false,

    validateProperty: function (name) {
        var meta = get(this.constructor, 'attributes').get(name);
        var value = get(this, name);
        var error = DS.Validation.validate(value, meta);
        if (error) {
            this.errors = this.errors || {};
            this.errors[name] = error;
        }
        return error;
    },

    validate: function () {
        this.eachAttribute(function (name) {
            this.validateProperty(name);
        }, this);
        return this.errors;
    },

    didChangeState: function () {
        var state = get(this, 'stateManager.currentState');
        if (state.name == 'uncommitted') {
            if (state.parentState.name == 'updated') {
                if (this.validate()) {
                    this.send('becameInvalid');
                }
            }
        }
    }.observes('stateManager.currentPath')
});