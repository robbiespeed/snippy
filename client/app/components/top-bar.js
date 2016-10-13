import Ember from 'ember';

const { inject } = Ember;

export default Ember.Component.extend({
  tagName: 'section',
  classNames: [ 'top-bar' ],
  user: inject.service(),

  signOut () {
    this.get('user').logout();
  }
});
