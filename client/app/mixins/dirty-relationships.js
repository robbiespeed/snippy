import Ember from 'ember';

const { computed } = Ember;

function checkDirtyRelationships () {
  const dirtyRelationships = this.get('_dirtyRelationships');
  let anyDirty = false;

  this.eachRelationship((key, descriptor) => {
    // only care about hasMany and belongsTo
    if (descriptor.kind === 'hasMany' || descriptor.kind === 'belongsTo') {
      // use kind to either grab from hasMany or belongsTo
      const { canonicalMembers, members } =
        this[descriptor.kind](key)[descriptor.kind + 'Relationship'];

      // if it's dirty store the relationship diff in changedRelationships
      if (
        // (either canonicalMembers or members do exist) AND
        (canonicalMembers || members) &&
        // (canonicalMembers does not equal members) AND
        (canonicalMembers !== members) &&
        // (size isn't equal) OR
        (canonicalMembers.size !== members.size) ||
        // any members missing from members
        canonicalMembers.toArray().any((member) => !members.has(member))
      ) {
        anyDirty = true;
        dirtyRelationships.set(key, descriptor);
      }
      // else if not dirty delete the relationship diff in changedRelationships
      else if (dirtyRelationships.has(key)) {
        dirtyRelationships.delete(key);
      }
    }
  });

  return anyDirty;
}

export default Ember.Mixin.create({
  init () {
      this._super(...arguments);
      const dependencies = [];
      this.eachRelationship((key, descriptor) => {
        if (descriptor.kind === 'hasMany') {
          dependencies.push(key + '.[]');
        }
        else if (descriptor.kind === 'belongsTo') {
          dependencies.push(key);
        }
      });
      this.set('_dirtyRelationships', new Map());
      this.set('hasDirtyRelationships',
        computed(...dependencies, checkDirtyRelationships)
      );
    },
    changedRelationships () {
      let changedRelationships = {};
      if (this.get('hasDirtyRelationships')) {
        for (const [key, descriptor] of this.get('_dirtyRelationships')) {
          const { canonicalMembers, members } =
            this[descriptor.kind](key)[descriptor.kind + 'Relationship'];
          changedRelationships[key] = [canonicalMembers, members];
        }
      }
      return changedRelationships;
    },
    hasDirtyData: computed.or('hasDirtyAttributes', 'hasDirtyRelationships'),
});
