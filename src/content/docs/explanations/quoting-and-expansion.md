---
title: Quoting & Expansion
description: Why quoting rules feel odd and how expansions interact with each other.
---

Bash's quoting and expansion system can feel confusing at first, but it follows consistent rules. Understanding the order of expansions and how quoting affects them is key to writing predictable scripts and avoiding common pitfalls.

## The Expansion Pipeline

Bash processes command lines through a specific sequence of expansions. Each expansion happens in a defined order, and quoting can prevent or modify these expansions.

### Expansion Order

1. **Brace expansion**: `{a,b,c}` → `a b c`
2. **Tilde expansion**: `~` → `/home/user`
3. **Parameter expansion**: `$var` → value of var
4. **Command substitution**: `$(cmd)` → output of cmd  
5. **Arithmetic expansion**: `$((expr))` → result of expression
6. **Word splitting**: Split on `$IFS` characters
7. **Pathname expansion (globbing)**: `*.txt` → matching filenames

Understanding this order explains many seemingly odd behaviors:

```bash
# Why this doesn't work as expected
var="*.txt"
echo {$var,backup}        # Brace expansion happens before parameter expansion
# Result: {*.txt,backup} (literal, no brace expansion)

# This works because parameter expansion happens first
var="a,b,c"
echo {$var}               # Error: brace expansion sees {a,b,c} as literal

# But this works
echo {$(echo "a,b,c")}    # Command substitution provides a,b,c before brace expansion
```

## Parameter Expansion Deep Dive

Parameter expansion is the most complex expansion mechanism, with many forms that provide powerful text processing capabilities.

### Basic Forms

```bash
var="hello world"

# Basic expansion
echo $var                 # hello world
echo ${var}               # hello world (explicit form)

# Length
echo ${#var}              # 11 (length of string)

# Safe expansion (prevents word splitting)
echo "$var"               # hello world (single argument)
echo $var                 # hello world (two arguments: "hello" and "world")
```

### Default and Alternative Values

```bash
# Default values
echo ${var:-default}      # Use "default" if var is unset or empty
echo ${var-default}       # Use "default" if var is unset (empty is ok)

# Assignment defaults  
echo ${var:=default}      # Set var to "default" if unset or empty, then use it
echo ${var=default}       # Set var to "default" if unset (empty is ok)

# Error on unset
echo ${var:?error msg}    # Exit with error if var is unset or empty
echo ${var?error msg}     # Exit with error if var is unset

# Alternative values
echo ${var:+alternate}    # Use "alternate" if var is set and non-empty
echo ${var+alternate}     # Use "alternate" if var is set (even if empty)
```

### String Manipulation

```bash
path="/home/user/documents/file.txt"

# Prefix/suffix removal
echo ${path#*/}           # Remove shortest match from beginning: home/user/documents/file.txt
echo ${path##*/}          # Remove longest match from beginning: file.txt (basename)
echo ${path%/*}           # Remove shortest match from end: /home/user/documents (dirname)  
echo ${path%%/*}          # Remove longest match from end: (empty, removed everything after first /)

# String replacement
echo ${path/user/admin}   # Replace first occurrence: /home/admin/documents/file.txt
echo ${path//o/0}         # Replace all occurrences: /h0me/user/d0cuments/file.txt

# Case conversion (Bash 4+)
name="Alice Smith"
echo ${name^}             # Uppercase first char: Alice Smith
echo ${name^^}            # Uppercase all: ALICE SMITH
echo ${name,}             # Lowercase first char: alice Smith
echo ${name,,}            # Lowercase all: alice smith
```

### Array Expansion

```bash
arr=(one two three four five)

# Basic array expansion
echo ${arr[0]}            # First element: one
echo ${arr[@]}            # All elements: one two three four five
echo ${arr[*]}            # All elements joined by first char of IFS: one two three four five

# Array slicing
echo ${arr[@]:1:3}        # Elements 1-3: two three four
echo ${arr[@]:2}          # From element 2 to end: three four five

# Array length
echo ${#arr[@]}           # Number of elements: 5
echo ${#arr[0]}           # Length of first element: 3

# Keys (indices)
echo ${!arr[@]}           # All indices: 0 1 2 3 4
```

## Quoting Interactions

Different quote types interact with expansions in specific ways that determine which expansions occur.

### Single Quotes: No Expansion

Single quotes prevent **all** expansions:

```bash
var="hello"
file="test.txt"

echo '$var $(date) ${file%.txt} {a,b,c} *.sh'
# Output: $var $(date) ${file%.txt} {a,b,c} *.sh (all literal)
```

### Double Quotes: Selective Expansion

Double quotes allow some expansions but prevent others:

```bash
var="hello world"
files="*.txt"

# These expansions happen inside double quotes:
echo "Parameter: $var"                    # Parameter: hello world
echo "Command: $(date)"                   # Command: Tue Jan 1 12:00:00
echo "Arithmetic: $((2 + 3))"             # Arithmetic: 5
echo "Length: ${#var}"                    # Length: 11

# These expansions DON'T happen inside double quotes:
echo "Brace: {a,b,c}"                     # Brace: {a,b,c} (literal)
echo "Glob: *.txt"                        # Glob: *.txt (literal)
echo "Files: $files"                      # Files: *.txt (literal, no glob expansion)

# Word splitting is prevented
echo "$var"                               # Single argument: "hello world"
echo $var                                 # Two arguments: "hello" "world"
```

### ANSI-C Quotes: Escape Processing

ANSI-C quotes (`$'...'`) process escape sequences but prevent other expansions:

```bash
var="hello"
echo $'Line 1\nLine 2\t$var'
# Output:
# Line 1
# Line 2    $var

# Escape sequences are processed, but $var remains literal
```

## Word Splitting Mechanics

Word splitting occurs on unquoted expansions, using the `IFS` (Internal Field Separator) variable.

### Default IFS Behavior

```bash
# Default IFS is space, tab, and newline
IFS=$' \t\n'

var="one two three"
echo $var                                 # Three separate arguments
printf "Arg: '%s'\n" $var                 # Shows three arguments

# Quoting prevents word splitting
printf "Arg: '%s'\n" "$var"              # Shows one argument
```

### Custom IFS for Data Processing

```bash
# Process CSV data
data="name,email,age"
IFS=','
read -r name email age <<< "$data"
echo "Name: $name, Email: $email, Age: $age"

# Or use array assignment
IFS=',' read -ra fields <<< "$data"
printf "Field: %s\n" "${fields[@]}"

# Restore default IFS
IFS=$' \t\n'
```

### IFS and Array Processing

```bash
# Split string into array
data="apple:banana:cherry"
IFS=':' read -ra fruits <<< "$data"

# Process each fruit
for fruit in "${fruits[@]}"; do
    echo "Fruit: $fruit"
done

# Alternative: parameter expansion
fruits_string="apple:banana:cherry"
fruits=(${fruits_string//:/ })            # Replace colons with spaces, then split
```

## Pathname Expansion (Globbing)

Globbing happens last in the expansion sequence and can interact unexpectedly with other expansions.

### Basic Glob Patterns

```bash
# These patterns match filenames:
echo *.txt                               # All .txt files
echo file?.log                           # file1.log, fileA.log, etc.
echo file[0-9].txt                       # file0.txt through file9.txt
echo file[!0-9].txt                      # Files NOT ending with digit + .txt
```

### Glob Expansion in Variables

```bash
# Pattern stored in variable
pattern="*.txt"
echo $pattern                            # Expands to matching files!
echo "$pattern"                          # Literal *.txt

# Safe pattern handling
files=$(ls *.txt)                        # Store filenames, not pattern
echo "$files"                            # Shows filenames

# Or use arrays for multiple files
files=(*.txt)
printf "File: %s\n" "${files[@]}"
```

### Controlling Glob Expansion

```bash
# Disable globbing
set -f                                   # or set -o noglob
echo *.txt                               # Literal *.txt
set +f                                   # Re-enable globbing

# Handle case where no files match
shopt -s nullglob                        # Empty expansion if no matches
files=(*.nonexistent)
echo "Count: ${#files[@]}"               # Count: 0

shopt -u nullglob                        # Default: literal if no matches
files=(*.nonexistent)  
echo "Count: ${#files[@]}"               # Count: 1 (literal "*.nonexistent")
```

## Common Expansion Pitfalls

### Unquoted Variables

```bash
# Problem: word splitting and globbing
file="my document.txt"
cp $file backup/                         # Error: tries to copy "my" and "document.txt"

# Solution: quote the variable
cp "$file" backup/                       # Correctly copies "my document.txt"

# Problem: glob expansion in variable
pattern="*.txt"
rm $pattern                              # Removes all .txt files!

# Solution: quote to prevent expansion
echo "Pattern is: $pattern"              # Shows: Pattern is: *.txt
```

### Array Expansion Issues

```bash
files=("file one.txt" "file two.txt")

# Wrong: loses spaces in filenames
for file in ${files[@]}; do              # Treats "file" and "one.txt" separately
    echo "Processing: $file"
done

# Right: preserves spaces
for file in "${files[@]}"; do            # Treats "file one.txt" as single item
    echo "Processing: $file"
done

# Wrong: all elements become single string
echo ${files[*]}                         # file one.txt file two.txt (joined)

# Right: separate arguments
echo "${files[@]}"                       # Two separate arguments preserved
```

### Command Substitution Context

```bash
# Command substitution creates subshell
var="outer"
result=$(var="inner"; echo $var)         # $result contains "inner"
echo $var                                # Still "outer"

# Expansions happen in subshell context
today=$(date +%Y-%m-%d)
echo "Today is $today"                   # Works: substitution happened first

# But watch out for nested quotes
message=$(echo "It's $(date +%H:%M)")    # Careful with nested quotes
message=$(echo "It's $(date +%H:%M')")   # This works better
```

## Best Practices for Reliable Expansions

### 1. Default to Quoting Variables

```bash
# Always quote variables unless you specifically want splitting/globbing
echo "$var"                              # Safe default
cp "$source" "$dest"                     # Handles spaces in filenames
[[ -f "$file" ]]                         # Works with any filename

# Only unquote when you want word splitting
words="one two three"
count_words() { echo $#; }
count_words $words                       # Correctly passes 3 arguments
```

### 2. Use Arrays for Multiple Items

```bash
# Good: array for multiple files
files=(*.txt)
for file in "${files[@]}"; do
    process "$file"
done

# Bad: string with embedded list
files="file1.txt file2.txt file3.txt"   # Breaks with spaces in names
```

### 3. Understand Expansion Context

```bash
# Expansion happens where the variable is used
get_pattern() { echo "*.txt"; }
pattern=$(get_pattern)                   # pattern contains "*.txt"
files=($pattern)                         # Glob expansion happens here

# vs.
get_files() { echo *.txt; }              # Glob expansion happens in function
files=($(get_files))                     # Already expanded filenames
```

### 4. Test Edge Cases

```bash
# Your script should handle these cases:
test_cases=(
    ""                                   # Empty string
    "file with spaces.txt"               # Spaces
    "file'with'quotes.txt"               # Single quotes
    'file"with"doublequotes.txt'         # Double quotes  
    "file*with*glob.txt"                 # Glob characters
    $'file\nwith\nnewlines.txt'          # Special characters
)

for test in "${test_cases[@]}"; do
    if [[ -n "$test" ]]; then
        echo "Testing: '$test'"
        # Your processing here
    fi
done
```

Understanding expansion order and quoting rules enables you to write predictable scripts that handle edge cases gracefully. The key insight is that expansions happen in a specific sequence, and quoting controls which expansions occur at each step.

## See Also

- Related concepts: [Variables](/concepts/variables/), [File Operations](/concepts/file-operations/)
- Related syntax: [Quoting](/reference/syntax/quoting/), [Parameter Expansion](/reference/syntax/parameter-expansion/)
- Related builtins: [`read`](/reference/builtins/read/), [`declare`](/reference/builtins/declare/)
