import Ember from 'ember';
import DirtyRelationshipsMixin from 'snippy-client/mixins/dirty-relationships';
import { module, test } from 'qunit';

module('Unit | Mixin | dirty relationships');

// Replace this with your real tests.
test('it works', function(assert) {
  let DirtyRelationshipsObject = Ember.Object.extend(DirtyRelationshipsMixin);
  let subject = DirtyRelationshipsObject.create();
  assert.ok(subject);
});
