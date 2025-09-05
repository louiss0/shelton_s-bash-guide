---
title: Quoting
description: How quotes affect expansion and word splitting in Bash.
---

Quoting in Bash controls which expansions occur and how words are split. Understanding quoting is essential for writing reliable scripts that handle filenames with spaces and special characters correctly.

## Synopsis

Bash provides several quoting mechanisms:

- `'...'` **Single quotes**: Literal, no expansion
- `"..."` **Double quotes**: Most expansions occur, but no globbing; preserve spaces
- `$'...'` **ANSI-C quoting**: Backslash escape sequences interpreted
- `\` **Backslash**: Escape single character

## Single Quotes (Literal)

Single quotes preserve the literal value of all characters within the quotes:

```bash
echo '$var'           # literal $var
echo '$HOME'          # literal $HOME  
echo '*.txt'          # literal *.txt
echo 'Line 1\nLine 2' # literal backslash and n
```

**Rules:**
- No expansions occur inside single quotes
- Cannot include a literal single quote inside single quotes
- To include a single quote, end the quoted string, add escaped quote, start new quoted string:

```bash
echo 'Don'\''t do this'  # Don't do this
echo "Don't do this"     # Simpler with double quotes
```

## Double Quotes (Preserving)

Double quotes preserve the literal value of most characters but allow certain expansions:

```bash
var="world"
echo "Hello $var"        # Hello world
echo "Home: $HOME"       # Home: /home/user
echo "Files: *.txt"      # literal *.txt (no globbing)
echo "Line 1\nLine 2"    # literal backslash and n
```

**What expands inside double quotes:**
- Parameter expansion: `$var`, `${var}`
- Command substitution: `$(command)`, `` `command` ``
- Arithmetic expansion: `$((expression))`

**What doesn't expand:**
- Pathname expansion (globbing): `*.txt` remains literal
- Brace expansion: `{a,b,c}` remains literal

**Special characters inside double quotes:**
```bash
echo "Quote: \"Hello\""   # Quote: "Hello"
echo "Backslash: \\"      # Backslash: \
echo "Dollar: \$"         # Dollar: $
echo "Backtick: \`"       # Backtick: `
```

## ANSI-C Quoting ($'...')

ANSI-C quoting allows backslash escape sequences:

```bash
echo $'Line 1\nLine 2'   # Two lines
echo $'Tab\tSeparated'   # Tab    Separated
echo $'Bell\a'           # Bell sound (if terminal supports)
echo $'Quote\''          # Quote'
```

**Common escape sequences:**
```bash
$'\a'    # Alert (bell)
$'\b'    # Backspace
$'\e'    # Escape character
$'\f'    # Form feed
$'\n'    # Newline
$'\r'    # Carriage return
$'\t'    # Horizontal tab
$'\v'    # Vertical tab
$'\\'    # Literal backslash
$'\''    # Single quote
$'\"'    # Double quote
$'\nnn'  # Character with octal value nnn
$'\xhh'  # Character with hex value hh
$'\uhhhh' # Unicode character (4 hex digits)
$'\Uhhhhhhhh' # Unicode character (8 hex digits)
```

## Backslash Escaping

Backslash escapes the next character:

```bash
echo \$HOME              # literal $HOME
echo \"Hello\"           # literal "Hello"
echo \\                  # literal backslash
echo \*.txt              # literal *.txt
```

Inside double quotes, backslash only escapes special characters:

```bash
echo "Escaped quote: \""
echo "Escaped dollar: \$"
echo "Literal backslash: \\"
echo "Literal newline: \n"  # Backslash remains
```

## Practical Examples

### Handling Filenames with Spaces

```bash
# Bad: breaks on spaces
file=my document.txt
cat $file                # Error: tries to cat 'my' and 'document.txt'

# Good: quoted variable
file="my document.txt"
cat "$file"              # Works correctly

# Good: quoted literal
cat "my document.txt"    # Works correctly
```

### Command Arguments

```bash
# Preserve multiple spaces
echo "word1     word2"   # word1     word2
echo word1     word2     # word1 word2 (spaces collapsed)

# Pass arguments with spaces
grep "search term" file.txt
find . -name "*.log file*"
```

### Variable Assignment with Spaces

```bash
# Correct ways to assign
message="Hello, World!"
path="/path/with spaces/file.txt"
command_output="$(date +%Y-%m-%d)"

# Multiple words need quotes
description="This is a long description"
```

### Mixing Quote Types

```bash
# Single quotes inside double quotes
echo "He said 'Hello' to me"

# Double quotes inside single quotes  
echo 'She replied "Hi there"'

# Complex mixing
echo "Config file: '"$HOME"'/.bashrc"
```

### Arrays and Quoting

```bash
# Array with spaces in elements
files=("file 1.txt" "file 2.txt" "file 3.txt")

# Correct iteration preserves spaces
for file in "${files[@]}"; do
    echo "Processing: $file"
done

# Incorrect: loses spaces
for file in ${files[@]}; do
    echo "Processing: $file"  # Breaks on spaces
done
```

## Best Practices

### 1. Always Quote Variables

```bash
# Good: always quote variables
if [[ -f "$file" ]]; then
    echo "Found: $file"
fi

# Bad: unquoted variable
if [[ -f $file ]]; then      # Breaks with spaces
    echo "Found: $file"
fi
```

### 2. Use Double Quotes for Variables, Single for Literals

```bash
# Good: double quotes for expansion
echo "Welcome, $USER!"

# Good: single quotes for literals
echo 'Literal string with $pecial characters'

# Good: command substitution
echo "Today is $(date +%A)"
```

### 3. Quote Command Line Arguments

```bash
# Good: handle arguments with spaces
process_file() {
    local file="$1"
    echo "Processing: $file"
}

# Usage
process_file "my file.txt"
```

### 4. Be Careful with Globs

```bash
# Expansion happens before quotes are processed
files="*.txt"
echo $files        # Expands glob
echo "$files"      # Literal *.txt

# For literal glob patterns, use single quotes
pattern='*.txt'
echo "$pattern"    # Literal *.txt
```

## Common Pitfalls

### Unquoted Variables

```bash
# Problem: word splitting
files="file1.txt file2.txt"
cat $files         # Tries to cat file1.txt and file2.txt separately

# Solution: quote the variable  
cat "$files"       # Error: no such file (but predictable)
```

### Nested Quoting

```bash
# Problem: complex nested quotes
eval "echo \"Hello \$USER\""

# Better: use ANSI-C quoting or here-doc
eval $'echo "Hello $USER"'
```

### Glob in Variables

```bash
# Problem: unexpected expansion
pattern=*.txt
echo $pattern      # May expand if .txt files exist

# Solution: quote appropriately
pattern="*.txt"    # Literal string
echo "$pattern"    # Literal *.txt

# Or use single quotes for literal patterns
pattern='*.txt'
```

## See Also

- Related concepts: [Variables](/concepts/variables/), [File Operations](/concepts/file-operations/)
- Related syntax: [Expansion](/reference/syntax/expansion/), [Redirection](/reference/syntax/redirection/)
