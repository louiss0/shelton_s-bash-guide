---
title: Reference Index
description: Inventory of Bash builtins, keywords, and syntax topics.
---

This section provides authoritative, concise descriptions of Bash components. Each page follows a consistent format: Synopsis, Parameters, Return codes, Examples, and Notes.

## 🔧 Builtins (to cover)

### Shell & Environment
- `alias`, `unalias` - Create and remove command aliases
- `type`, `command`, `builtin` - Identify and execute commands
- `hash` - Remember command locations
- `help` - Display help for builtins

### Variables & Scope  
- `declare`/`typeset` - Set variable attributes and declare variables
- `local` - Create function-local variables
- `export` - Export variables to environment
- `readonly` - Make variables read-only
- `unset` - Remove variables and functions
- `shift` - Shift positional parameters

### Input/Output & Printing
- `echo` - Print arguments to standard output
- `printf` - Format and print data
- `read` - Read input into variables
- `mapfile`/`readarray` - Read lines into array
- `readlink` - Print resolved symbolic links

### Flow Control & Tests
- `test`/`[` - Evaluate conditional expressions
- `[[` - Enhanced conditional expressions
- `case` - Pattern-based branching
- `select` - Generate select menus
- `let` - Evaluate arithmetic expressions
- `times` - Display process times

### Jobs & Processes
- `jobs` - List active jobs
- `fg`, `bg` - Foreground and background jobs
- `disown` - Remove jobs from job table
- `wait` - Wait for process completion
- `kill` - Terminate processes

### Directory Stack
- `cd` - Change directory
- `pwd` - Print working directory
- `pushd`, `popd` - Push/pop directory stack
- `dirs` - Display directory stack

### Execution & Evaluation
- `exec` - Replace shell with command
- `eval` - Evaluate and execute arguments
- `source`/`.` - Execute commands from file
- `trap` - Set signal handlers

### Options & Completion
- `set` - Set shell options and positional parameters
- `shopt` - Set shell options
- `complete`, `compgen`, `compopt` - Programmable completion

### Limits & Permissions
- `umask` - Set file creation mask
- `ulimit` - Set resource limits

### History
- `history` - Command history list
- `fc` - Fix command (history editing)

### Miscellaneous
- `getopts` - Parse option arguments
- `true`, `false` - Return success/failure
- `enable` - Enable/disable shell builtins

## 🔤 Keywords (reserved words)

Control flow: `if`, `then`, `else`, `elif`, `fi`, `case`, `esac`, `for`, `select`, `while`, `until`, `do`, `done`, `in`

Functions: `function`

Grouping: `{`, `}`

Tests: `[[`, `]]`

Timing: `time`

Processes: `coproc`

Logic: `!`

## 📝 Syntax Topics

### Quoting
- Single quotes `'...'`: Literal, no expansion
- Double quotes `"..."`: Most expansions, preserve spaces
- ANSI-C quoting `$'...'`: Backslash escape sequences
- Escaping with backslash `\`

### Expansions
- Parameter expansion: `${var}`, `${var:-default}`, `${var/pattern/replacement}`
- Command substitution: `$(command)`, `` `command` ``
- Arithmetic expansion: `$((expression))`
- Brace expansion: `{a,b,c}`, `{1..10}`
- Pathname expansion (globbing): `*`, `?`, `[...]`

### Redirection
- Output: `>`, `>>`
- Input: `<`
- File descriptors: `2>`, `2>&1`
- Here documents: `<<EOF`
- Here strings: `<<<word`
- Process substitution: `<(command)`, `>(command)`

### Pipelines & Command Lists
- Pipes: `|`
- Logical operators: `&&`, `||`
- Command separation: `;`, `&`
- Subshells: `(command)`
- Command grouping: `{ command; }`

### Conditionals & Tests
- Exit status semantics
- File tests: `-e`, `-f`, `-d`, `-r`, `-w`, `-x`
- String tests: `-z`, `-n`, `=`, `!=`
- Numeric tests: `-eq`, `-ne`, `-lt`, `-le`, `-gt`, `-ge`

### Loops
- `for` loops: C-style and list iteration
- `while` and `until` loops
- `select` menus
- Loop control: `break`, `continue`

### Arrays
- Indexed arrays: `arr=(a b c)`
- Associative arrays: `declare -A arr=([key]=value)`
- Array expansion: `"${arr[@]}"`, `"${arr[*]}"`
- Array slicing: `"${arr[@]:start:length}"`

### Patterns & Regular Expressions
- Glob patterns vs `[[ =~ ]]` regex matching
- Pattern matching in `case` statements
- Filename expansion patterns
