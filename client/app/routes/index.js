import Ember from 'ember';

export default Ember.Route.extend({
  model () {
    return this.get('store').findAll('snippet')
      .catch((reason) => {
        console.log(reason);
        return Ember.Object.create({
          error: 'Snippets could not be retrieved'
        });
      });
  }
});
