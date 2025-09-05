---
title: export
description: Make variables available to child processes.
---

## Synopsis
export [-fn] [name[=value] ...] or export -p

## Parameters
- -f: export functions instead of variables
- -n: remove the export attribute from variables
- -p: display all exported variables

## Return codes
0 on success, non-zero on invalid variable name or read-only variable.

## Minimal examples
```bash
export PATH="/usr/local/bin:$PATH"
export EDITOR="vim"
name="local"; export name  # two-step export
export -p  # list all exports
```

## Notes
Only exported variables are inherited by child processes. Functions can also be exported with -f.
