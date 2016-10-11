import DS from 'ember-data';
import ENV from 'snippy-client/config/environment';

export default DS.JSONAPIAdapter.extend({
    host: ENV.APP.HOST,
});
