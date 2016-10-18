import Ember from 'ember';

const { computed, inject } = Ember;

export default Ember.Component.extend({
  store: inject.service(),

  classNames: [ 'tag-input' ],
  tags: [],
  pendingTags: [],

  isShowTags: computed('tags.[]', 'pendingTags.[]', function () {
    return !!(this.get('tags.length') || this.get('pendingTags.length'));
  }),

  add () {
    const tagString = this.get('newTag');
    console.log(tagString);
    if (tagString) {
      const pendingTags = this.get('pendingTags');
      const tags = this.get('tags');

      if (!(
        pendingTags.includes(tagString) ||
        tags.isAny('name', tagString)
      )) {
        const store = this.get('store');
        const allLoadedTags = store.peekAll('tag');
        const loadedTag = allLoadedTags.find((tag) => tag.get('name') === tagString);

        if (loadedTag) {
          tags.addObject(loadedTag);
          pendingTags.removeObject(tagString);
        }
        else {
          pendingTags.pushObject(tagString);

          // if tag can be found from the api use the found tag,
          // if there is no found tag, create one and use that
          // do all of this only if the tagString is still in the pending array
          // once tag is added remove tagString from the pending array
          store.query('tag', { filter: { name: tagString } })
            .then((response) => {
              const foundTag = response.get('firstObject');
              const isTagStillPending = pendingTags.includes(tagString);

              if (foundTag && isTagStillPending) {
                tags.addObject(foundTag);
                pendingTags.removeObject(tagString);
              }
              else if (isTagStillPending) {
                store.createRecord('tag', { name: tagString })
                  .save()
                  .then((createdTag) => {
                    if (createdTag && pendingTags.includes(tagString)) {
                      tags.addObject(createdTag);
                      pendingTags.removeObject(tagString);
                    }
                  });
              }
            });

        }
      }
      this.set('newTag', '');
    }
  },

  remove (list, tag) {
    list.removeObject(tag);
  }
});
