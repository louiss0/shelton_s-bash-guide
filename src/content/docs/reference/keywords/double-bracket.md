---
title: "[[" 
description: Extended test construct with pattern matching and regex.
---

## Synopsis
[[ EXPRESSION ]]

## Features over [ ]
- No word splitting or pathname expansion
- Pattern matching with == and !=
- Regular expression matching with =~
- Logical operators && and ||
- Empty variables don't need quotes

## Parameters
### All test/[ operators plus:
- STRING == PATTERN: pattern matching
- STRING != PATTERN: negated pattern matching  
- STRING =~ REGEX: regular expression matching
- EXPR1 && EXPR2: logical AND
- EXPR1 || EXPR2: logical OR

## Return codes
0 if expression is true, 1 if false, 2 on syntax error.

## Minimal examples
```bash
if [[ $file == *.txt ]]; then
  echo "Text file"
fi

if [[ $email =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
  echo "Valid email"
fi

if [[ -f $config && -r $config ]]; then
  echo "Config exists and readable"
fi

# No quotes needed for empty variables
if [[ $var == "test" ]]; then
  echo "Variable equals test"
fi
```

## Notes
Bash-specific extension. Use [ ] for POSIX compatibility. Safer than [ ] for variable handling.
