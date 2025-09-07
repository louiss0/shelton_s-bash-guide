---
title: test / [
description: Evaluate conditional expressions for use in if statements.
---

## Synopsis
test EXPRESSION or [ EXPRESSION ]

## Parameters
### File tests
- -e FILE: true if file exists
- -f FILE: true if file exists and is regular
- -d FILE: true if file exists and is directory
- -r FILE: true if file exists and is readable
- -w FILE: true if file exists and is writable
- -x FILE: true if file exists and is executable
- -s FILE: true if file exists and has size > 0

### String tests
- -z STRING: true if string length is zero
- -n STRING: true if string length is non-zero
- STRING1 = STRING2: true if strings are equal
- STRING1 != STRING2: true if strings are not equal

### Numeric tests
- INTEGER1 -eq INTEGER2: true if equal
- INTEGER1 -ne INTEGER2: true if not equal
- INTEGER1 -lt INTEGER2: true if less than
- INTEGER1 -le INTEGER2: true if less than or equal
- INTEGER1 -gt INTEGER2: true if greater than
- INTEGER1 -ge INTEGER2: true if greater than or equal

## Return codes
0 if expression is true, 1 if false, 2 on syntax error.

## Minimal examples
```bash
if test -f config.txt; then
  echo "Config file exists"
fi

if [ "$name" = "admin" ]; then
  echo "Hello admin"
fi

if [ $count -gt 10 ]; then
  echo "Count is greater than 10"
fi
```

## Notes
Prefer [[ ]] for more features and safer parsing. Always quote variables in [ ].
