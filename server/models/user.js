module.exports = {
  uid: String,
  ghid: Number,
  name: String,
  // github_oath: String,
  snippets_created: [ Array('snippet'), 'creator' ],
  snippets_starred: [ Array('snippet'), 'stargazers' ],
};
