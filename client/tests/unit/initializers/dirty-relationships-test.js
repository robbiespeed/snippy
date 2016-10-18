import Ember from 'ember';
import DirtyRelationshipsInitializer from 'snippy-client/initializers/dirty-relationships';
import { module, test } from 'qunit';

let application;

module('Unit | Initializer | dirty relationships', {
  beforeEach() {
    Ember.run(function() {
      application = Ember.Application.create();
      application.deferReadiness();
    });
  }
});

// Replace this with your real tests.
test('it works', function(assert) {
  DirtyRelationshipsInitializer.initialize(application);

  // you would normally confirm the results of the initializer here
  assert.ok(true);
});
