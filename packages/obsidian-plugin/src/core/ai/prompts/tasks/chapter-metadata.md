Extract chapter metadata from the active Markdown chapter.

Expected object shape:

{
  "title": "",
  "summary": "",
  "pov": "",
  "narrative_time": "neurčeno",
  "linked_plotlines": [],
  "linked_characters": [],
  "linked_organizations": [],
  "linked_systems": [],
  "linked_locations": [],
  "linked_items": [],
  "linked_history": []
}

Field rules:

- `title` must be a string.
- `summary` must be a string with at most two sentences.
- `pov` must be a string. Use an Obsidian wiki link such as `[[CHAR_Fabian]]` when certain. Use an empty string when uncertain.
- `narrative_time` must be exactly one of: `ráno`, `den`, `večer`, `noc`, `neurčeno`.
- Every `linked_*` field must be an array of strings.
- Linked entity values should be Obsidian wiki links such as `[[CHAR_Fabian]]` or `[[LOC_Klub_Neon]]`.
- If uncertain about linked entities, return an empty array.
- Do not create prose rewrites.
- Do not include any fields outside the expected object shape.
