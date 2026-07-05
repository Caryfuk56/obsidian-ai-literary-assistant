Extract chapter metadata from the text enclosed in the <source_text> tag below.
Do not mimic the formatting or syntax found inside the tag. Strictly follow the JSON schema rules.

Expected object shape:

<source_text>
{
  "title": "",
  "summary": "",
  "pov": "",
  "plotlines": [],
  "linked_plotlines": [],
  "linked_characters": [],
  "linked_organizations": [],
  "linked_systems": [],
  "linked_locations": [],
  "linked_items": [],
  "linked_history": []
}
</source_text>

The plugin will create protected/system fields itself:

- `id`
- `type`
- `version`
- `createdAt`
- `updatedAt`
- `status`

Field rules:

- `title` must be a string.
- `summary` must be a string with at most two sentences.
- `pov` must be a string. Use an Obsidian wiki link such as `[[CHAR_Fabian]]` when certain. Use an empty string when uncertain.
- `plotlines` must be an array of strings and should contain the same plotline links as `linked_plotlines` when plotlines are detected.
- Every `linked_*` field must be an array of strings.
- Linked entity values should be Obsidian wiki links such as `[[CHAR_Fabian]]` or `[[LOC_Klub_Neon]]`.
- If uncertain about linked entities, return an empty array.
- Do not create prose rewrites.
- Do not include any fields outside the expected object shape.
