import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('snippets', function() {
    this.route('snippet', { path: '/:snippet_id' });
    this.route('new');
    this.route('edit', { path: '/:snippet_id/edit' });
  });
});

export default Router;
