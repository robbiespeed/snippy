module.exports = {
  name: String,
  code: String,
  example: String,
  tags: [ Array('tag') ],
  creator: [ 'user', 'snippets_created' ],
  stargazers: [ Array('user'), 'snippets_starred' ]
};
