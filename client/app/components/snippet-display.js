import Ember from 'ember';

export default Ember.Component.extend({
  classNames: [ 'snippet-display' ],


  toggleStar () {
    this.get('snippet').toggleStar();
  },
});
