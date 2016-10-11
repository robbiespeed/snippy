import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  code: DS.attr('string'),
  example: DS.attr('string'),
  tags: DS.hasMany('tag'),
});
