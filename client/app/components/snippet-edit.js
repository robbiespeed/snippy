import Ember from 'ember';

const { computed, inject } = Ember;

export default Ember.Component.extend({
  user: inject.service(),

  tagName: 'section',
  classNames: [ 'snippet-edit' ],

  model: null,

  isError: false,

  canSubmit: computed('model.{name,code,hasDirtyData}', function () {
    const model = this.get('model');
    return model.get('hasDirtyData') && model.get('name') && model.get('code');
  }),

  submit () {
    const model = this.get('model');

    if (model.get('isNew')) {
      model.set('creator', this.get('user.model'));
    }

    model.save()
      .then(() => {
        const success = this.get('success');
        if (typeof success === 'function') {
          success(model);
        }
      })
      .catch((reason) => {
        console.log(reason);
        this.set('isError', true);
      });
  },

  willDestroyElement () {
    this._super(...arguments);

    this.get('model').rollbackAttributes();
  },
});
