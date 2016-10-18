import DS from 'ember-data';
import Ember from 'ember';

const { computed, inject } = Ember;

export default DS.Model.extend({
  user: inject.service(),

  name: DS.attr('string'),
  code: DS.attr('string'),
  example: DS.attr('string'),
  tags: DS.hasMany('tag'),
  creator: DS.belongsTo('user'),
  stargazers: DS.hasMany('user'),

  starCount: computed('stargazers.[]', function () {
    return this.hasMany('stargazers').ids().length;
  }),

  isStarred: computed('stargazers.[]', 'user.model', function () {
    return this.hasMany('stargazers').ids().includes(this.get('user.model.id'));
  }),

  canEdit: computed('creator', 'user.model', function () {
    return this.belongsTo('creator').id() === this.get('user.model.id');
  }),

  toggleStar () {
    const user = this.get('user.model');
    if (user) {
      if (this.get('isStarred')) {
        this.get('stargazers').removeObject(this.get('user.model'));
      }
      else {
        this.get('stargazers').addObject(this.get('user.model'));
      }
      this.save();
    }
  }
});
