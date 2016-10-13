import Ember from 'ember';

const { inject, observer, run } = Ember;

export default Ember.Controller.extend({
  user: inject.service(),
  // TODO: user error param to display a modal
  queryParams: [ 'token' ],
  token: null,

  hasAuthed: false,

  tokenObserver: observer('token', function () {
    const storedToken = window.localStorage.getItem('token');
    const queryToken = this.get('token');
    const token = queryToken || storedToken;

    if (queryToken || (storedToken && !this.get('hasAuthed'))) {
      const user = this.get('user');
      if (user.get('model')) {
        user.logout();
      }
      if (token !== storedToken) {
        window.localStorage.setItem('token', token);
      }
      user.set('token', token);
      user.fetchUser();

      this.get('hasAuthed', true);
      // so the query param in the url goes away
      run.next(() => this.set('token', null));
    }
  }).on('init'),
});
