---
title: unset
description: Remove variables and functions.
---

## Synopsis
unset [-fv] [name ...]

## Parameters
- -f: remove functions instead of variables
- -v: remove variables (default behavior)

## Return codes
0 on success, non-zero if name is readonly or doesn't exist.

## Minimal examples
```bash
var="hello"
unset var
echo ${var:-"undefined"}  # outputs: undefined

function test() { echo "hi"; }
unset -f test
```

## Notes
Cannot unset readonly variables or special shell variables like $1, $@, etc.
