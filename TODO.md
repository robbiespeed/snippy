# TODO

- Style code blocks so line numbers are on left (use flex)

- Routes mapped to `name` rather than `id`
  - [ ] (Server) Disallow creation of snippets/tags with conflicting `name` (lower-case underscore)
  - [ ] (Server) Add `name_id` attribute (lower-case underscore of `name`)
  - [ ] (Client) Map routes to `name_id`, use `/snippets?filter[name_id]=hello_world`


- Snippet routes  
  - `/snippets/:snippet_name` - shows the snippet code and example
  - `/snippets` - shows list of all snippets (searchable)
  - `/snippets/:snippet_name/edit` - Allows editing of snippet
  - `/snippets/new` - allow for creation of new tags


- Tag routes  
  - `/tags/:tag_name` - redirect to `/snippets?tags=:tag_name`
  - `/tags` - shows list of all tags (perhaps searchable)
  - `/tags/:tag_name/edit` - Allows editing of tag
  - `/tags/new` - allow for creation of new tags
