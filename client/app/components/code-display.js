import Ember from 'ember';

const { computed } = Ember;

export default Ember.Component.extend({
  // tagName: 'code',
  classNames: 'code-display',

  code: '',
  lines: computed('code', function () {
    return this.get('code').split('\n');
  }),
  lineNumbers: computed('lines', function () {
    return this.get('lines').map((line, i) => i + 1);
  }),
});
