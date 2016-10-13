import Ember from 'ember';
import ENV from 'snippy-client/config/environment';

const { inject } = Ember;

export default Ember.Service.extend({
  snippyApi: inject.service(),
  store: inject.service(),

  loginUrl: Ember.String.htmlSafe(`${ENV.APP.HOST}/login`),
  model: null,
  token: null,
  isFetching: false,

  login () {
    this.get('snippyApi').request('login');
  },
  fetchUser () {
    this.set('isFetching', true);
    return this.get('snippyApi').request('authed-user')
      .then((response) => {
        this.set('isFetching', false);
        if (!this.get('model')) {
          const store = this.get('store');
          store.pushPayload(response);
          this.set('loggedIn', true);

          return this.set('model', store.peekRecord('user', response.data.id));
        }
        else {
          return this.get('model');
        }
      });
  },
  logout () {
    this.setProperties({
      model: null,
      token: null,
      isFetching: false,
    });
    window.localStorage.removeItem('token');
  }
});
