# Release Notes

Add markdown files here to describe changes for the next release.

## Format

```md
---
bump: minor
---

## Title

Description of the change.
```

`bump` can be `major`, `minor`, or `patch`. When multiple files exist,
the highest bump type wins.

After the version PR is merged, files are moved to `processed/`.
