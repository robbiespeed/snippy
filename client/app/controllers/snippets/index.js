import Ember from 'ember';
import { PromiseArray } from 'ember-data/-private/system/promise-proxies';

const { computed } = Ember;

export default Ember.Controller.extend({
  searchNameString: '',
  searchTagsString: '',

  searchTags: computed('searchTagsString', function () {
    return this.get('searchTagsString').toLowerCase().split(', ');
  }),

  currentSnippets: computed('allSnippets.content', function () {
    this.get('allSnippets');
    return this.get('store').peekAll('snippet');
  }),

  allSnippets: computed(function () {
    return PromiseArray.create({
      promise: this.get('store').findAll('snippet')
    });
  }),

  filteredSnippets: computed(
    'currentSnippets.@each.{name,tags}', 'searchNameString', 'searchTags',
    function () {
      const searchName = this.get('searchNameString').toLowerCase();
      const searchTags = this.get('searchTags');

      return this.get('currentSnippets').filter((snippet) => {
        const name = snippet.get('name').toLowerCase();
        const tagNames = snippet.get('tags').reduce((reduced, tag) => {
          const tagName = tag.get('name');
          if (tagName) {
            reduced.push(tagName.toLowerCase());
          }
          return reduced;
        }, []);

        const nameMatch = !searchName.length || name.includes(searchName);
        const tagMatch = searchTags[0] === '' ||
          searchTags.every((searchTag) => tagNames.includes(searchTag));

        return nameMatch && tagMatch;
      });
    }
  ),

});
