import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  uid: DS.attr('string'),
  snippetsCreated: DS.hasMany('snippet', { inverse: 'creator' }),
  snippetsStarred: DS.hasMany('snippet', { inverse: 'stargazers' }),
});
