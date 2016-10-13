import Ember from 'ember';
import AjaxService from 'ember-ajax/services/ajax';
import ENV from 'snippy-client/config/environment';

const { computed, inject } = Ember;

export default AjaxService.extend({
  user: inject.service(),
  host: ENV.APP.HOST,
  headers: computed('user.token', function () {
    let headers = {};
    const token = this.get('user.token');
    if (token) {
      headers['Authorization'] = token;
    }
    return headers;
  }),
});
