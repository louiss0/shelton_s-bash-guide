---
title: local
description: Create function-scoped variables.
---

## Synopsis
local [option] [name[=value] ...] or local -p

## Parameters
- -a: indexed array
- -A: associative array
- -i: integer attribute
- -n: nameref attribute
- -r: readonly attribute
- -x: export attribute
- -p: display local variables

## Return codes
0 on success, non-zero when not used within a function or invalid options.

## Minimal examples
```bash
function myfunc() {
  local name="$1"
  local -i count=0
  local -A data=([key]="value")
  echo "Hi, $name"
}
```

## Notes
Only works inside functions. Prevents variables from leaking to global scope.
