import DS from 'ember-data';
import DRM from 'snippy-client/mixins/dirty-relationships';

export function initialize(/* application */) {
  DS.Model.reopen(DRM);
}

export default {
  name: 'dirty-relationships',
  initialize
};
