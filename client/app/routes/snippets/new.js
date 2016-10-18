import Ember from 'ember';

export default Ember.Route.extend({
  model () {
    return this.get('store').createRecord('snippet');
  },
  actions: {  
    success (model) {
      this.transitionTo('snippets.snippet', model);
    },
  },
});
