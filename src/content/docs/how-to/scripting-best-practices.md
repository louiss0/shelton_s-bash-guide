---
title: Bash Scripting Best Practices
description: Practical Bash scripting guide with structure, error handling, debugging, and real-world examples from beginner to intermediate level.
---

# Overview

This guide takes you from your first script to well-structured, reliable Bash tools. It favors practical patterns you can copy, adapt, and extend.

What you will learn:
- Basic script structure and execution
- Variables, parameters, and arguments
- Functions, flow control, and modularity
- Error handling and debugging techniques
- Best practices for organization and style
- Real-world examples with progressive complexity

Target shell: Bash 4+. Use the portable shebang below to ensure Bash is used.

## 1. Script Creation and Structure

- **Shebang**: Always pick the interpreter explicitly
- **Strict mode**: Use strict mode to catch common pitfalls early
- **Documentation**: Document purpose and usage at the top
- **Quoting**: Always quote expansions and prefer long-form tests

### Minimal Starter Template

```bash path=null start=null
#!/usr/bin/env bash
# shellcheck shell=bash

set -Eeuo pipefail
IFS=$'\n\t'

# About:
#   Briefly describe what this script does.
# Usage:
#   ./script.sh [options]
# Example:
#   ./script.sh --help

main() {
  echo "Hello from Bash"
}

main "$@"
```

### Key Settings Explained

- `#!/usr/bin/env bash`: Resolves Bash via PATH (portable)
- `set -Eeuo pipefail`: Enables safer defaults
- `IFS=$'\n\t'`: Sets a safer default for word-splitting

## 2. Make it Executable and Run it

```bash path=null start=null
chmod +x ./script.sh
./script.sh
# Or pass explicitly to the interpreter:
bash ./script.sh
```

**Pro tip**: Place scripts in a `bin` directory that's on your `PATH` for system-wide convenience.

## 3. Variables, Parameters, and Arguments

### Basic Rules
- Assign with `name=value` (no spaces)
- Always quote expansions: `"$var"`
- Use `readonly` for constants
- Prefer `local` variables inside functions

### Examples

```bash path=null start=null
#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

APP_NAME="example"
readonly VERSION="1.0.0"

greet() {
  local name="${1:-world}"
  echo "Hello, $name"
}

greet "$@"
```

### Arrays and Associative Arrays

```bash path=null start=null
# Indexed array
nums=(one two three)
echo "${nums[0]}"
echo "${#nums[@]}"     # length
printf '%s\n' "${nums[@]}"

# Associative array (Bash 4+)
declare -A user
user[name]="Sam"
user[id]="42"
echo "${user[name]}"
```

### Parameter Expansion Helpers

- **Default**: `"${var:-default}"`
- **Required**: `"${var:?message}"`
- **Trim**: `"${var#prefix}"` and `"${var%suffix}"`

### Arguments

- `"$0"` is the script name
- `"$1"` `"$2"` are positional arguments
- `"$@"` expands each arg as a separate word; prefer `"$@"` over `"$*"`

## 4. Functions and Control Flow

### Functions

```bash path=null start=null
log() { printf '%s\n' "$*"; }

add() {
  local a="$1" b="$2"
  echo "$(( a + b ))"
}
```

### Conditionals

```bash path=null start=null
if [[ -f "$file" ]]; then
  echo "File exists"
elif [[ -d "$file" ]]; then
  echo "Directory"
else
  echo "Missing"
fi
```

### Loops

```bash path=null start=null
for f in *.txt; do
  printf 'Found: %s\n' "$f"
done

while read -r line; do
  printf 'Line: %s\n' "$line"
done < input.txt
```

### Case Statements

```bash path=null start=null
case "$1" in
  start) echo "Starting";;
  stop)  echo "Stopping";;
  *)     echo "Usage: $0 start|stop" >&2; exit 1;;
esac
```

## 5. Parsing Options with getopts

Use `getopts` for short flags. You can map to long flags manually.

```bash path=null start=null
show_help() {
  cat <<'TXT'
Usage:
  backup.sh -s source -d dest [-n] [-v]

Options:
  -s   Source directory
  -d   Destination directory
  -n   Dry run
  -v   Verbose
  -h   Help
TXT
}

SOURCE=""
DEST=""
DRY_RUN=false
VERBOSE=false

while getopts ":s:d:nvh" opt; do
  case "$opt" in
    s) SOURCE="$OPTARG";;
    d) DEST="$OPTARG";;
    n) DRY_RUN=true;;
    v) VERBOSE=true;;
    h) show_help; exit 0;;
    \?) echo "Unknown option: -$OPTARG" >&2; exit 2;;
    :) echo "Missing arg for -$OPTARG" >&2; exit 2;;
  esac
done
shift $((OPTIND - 1))

[[ -z "$SOURCE" || -z "$DEST" ]] && { echo "Missing -s and -d" >&2; exit 2; }
```

## 6. Error Handling and Debugging

### Recommended Header

```bash path=null start=null
set -Eeuo pipefail
IFS=$'\n\t'
```

**Options explained:**
- `e`: Exit on uncaught errors
- `E`: Propagate traps to functions
- `u`: Error on unset variables
- `o pipefail`: Fail a pipeline if any part fails

### Traps

```bash path=null start=null
cleanup() {
  local ec="$?"
  # Perform cleanup if needed
  if [[ "$ec" -ne 0 ]]; then
    printf 'Error exit code: %s\n' "$ec" >&2
  fi
}
trap cleanup EXIT
```

### Logging Helpers

```bash path=null start=null
log()   { printf '%s\n' "$*"; }
warn()  { printf 'WARN: %s\n' "$*" >&2; }
error() { printf 'ERROR: %s\n' "$*" >&2; }
die()   { error "$*"; exit 1; }
```

### Command Checks

```bash path=null start=null
command -v rsync >/dev/null 2>&1 || die "rsync is required"
```

### Debugging

- `set -x` to enable trace, `set +x` to disable
- Use `PS4` to prefix trace lines: `PS4='+ ${BASH_SOURCE}:${LINENO}: '`

### Important Note on set -e

With `pipefail`, an early failure will abort the pipeline. Be careful: `set -e` does not trigger on every failure context. Prefer explicit checks for critical steps.

## 7. Best Practices for Organization

### Directory Layout
```
project/
├── scripts/     # or bin/ for executables
├── lib/         # for sourced helpers
└── test/        # for Bats tests (optional)
```

### Script Template Structure
- Strict mode
- Usage function
- Logging helpers
- Argument parsing (`getopts` or manual)
- Main function that orchestrates

### Portability Guidelines
- Use Bash features when you require Bash
- Prefer `command -v` over `which`
- Quote all expansions
- Use `--` with commands like `rm` and `mv`
- Use `mktemp` for temporary files and dirs

### Tooling
- **Static analysis**: `shellcheck`
- **Formatting**: `shfmt`
- **Testing**: `bats-core` (optional)

### Data Handling
- Use `read -r` to prevent backslash escapes
- For file iteration, prefer `while read` loops or globs over parsing `ls`

### Performance
- Use built-ins when possible
- Avoid unnecessary subshells

## 8. Progressive Real-World Examples

### A. Hello World with Arguments

```bash path=null start=null
#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

name="${1:-world}"
echo "Hello, $name"
```

### B. Bulk Rename with Prefix

```bash path=null start=null
#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

prefix="${1:-prefix_}"
shopt -s nullglob
for f in *.jpg; do
  mv -- "$f" "${prefix}${f}"
done
```

### C. Log Archiver (Older Than N Days)

```bash path=null start=null
#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

dir="${1:-./logs}"
days="${2:-7}"

archive="logs_$(date +%F).tar.gz"
tar -C "$dir" -czf "$archive" .

find "$dir" -type f -mtime "+$days" -print -delete
echo "Archived to $archive and pruned files older than $days days"
```

### D. Robust CLI Skeleton (Reusable)

```bash path=null start=null
#!/usr/bin/env bash
# shellcheck shell=bash
set -Eeuo pipefail
IFS=$'\n\t'

VERSION="1.0.0"

usage() {
  cat <<'TXT'
Usage:
  tool.sh [options] [args...]

Options:
  -q           Quiet
  -v           Verbose
  -h           Help
  --version    Show version

Examples:
  tool.sh -v input.txt
TXT
}

QUIET=false
VERBOSE=false

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --version) echo "$VERSION"; exit 0;;
      -h|--help) usage; exit 0;;
      -q) QUIET=true; shift;;
      -v) VERBOSE=true; shift;;
      --) shift; break;;
      -*) echo "Unknown option: $1" >&2; usage; exit 2;;
      *)  break;;
    esac
  done
  ARGS=("$@")
}

log()   { "$QUIET" && return 0; printf '%s\n' "$*"; }
debug() { "$VERBOSE" || return 0; printf 'DEBUG: %s\n' "$*"; }
die()   { printf 'ERROR: %s\n' "$*" >&2; exit 1; }

main() {
  parse_args "$@"
  debug "Args: ${ARGS[*]-}"
  # Your core logic here
  log "Done"
}

trap 'ec="$?"; [[ "$ec" -ne 0 ]] && printf "Exit code: %s\n" "$ec" >&2' EXIT
main "$@"
```

### E. Backup Script with getopts and Dry Run

```bash path=null start=null
#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

SOURCE=""
DEST=""
DRY_RUN=false

usage() {
  cat <<'TXT'
Usage:
  backup.sh -s source -d dest [-n]

Options:
  -s   Source directory
  -d   Destination directory
  -n   Dry run
TXT
}

while getopts ":s:d:n" opt; do
  case "$opt" in
    s) SOURCE="$OPTARG";;
    d) DEST="$OPTARG";;
    n) DRY_RUN=true;;
    \?) echo "Unknown option: -$OPTARG" >&2; exit 2;;
    :) echo "Missing arg for -$OPTARG" >&2; exit 2;;
  esac
done
shift $((OPTIND - 1))

[[ -z "$SOURCE" || -z "$DEST" ]] && { usage; exit 2; }

RSYNC_OPTS=(-a --delete)
"$DRY_RUN" && RSYNC_OPTS+=(-n)

command -v rsync >/dev/null 2>&1 || { echo "rsync not found" >&2; exit 1; }
rsync "${RSYNC_OPTS[@]}" -- "$SOURCE/" "$DEST/"
echo "Backup complete"
```

## 9. Helpful Tools

- **shellcheck**: Catch bugs and style issues early
- **shfmt**: Format scripts consistently  
- **bats-core**: Testing framework for Bash scripts

## 10. Copy-Paste Template

Use this as your starting point for new scripts:

```bash path=null start=null
#!/usr/bin/env bash
# shellcheck shell=bash

set -Eeuo pipefail
IFS=$'\n\t'

usage() {
  cat <<'TXT'
Usage:
  myscript.sh [options]

Options:
  -h, --help     Show help
  -v, --version  Show version
TXT
}

VERSION="0.1.0"
QUIET=false
VERBOSE=false
ARGS=()

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      -h|--help) usage; exit 0;;
      -v|--version) echo "$VERSION"; exit 0;;
      -q|--quiet) QUIET=true; shift;;
      --verbose) VERBOSE=true; shift;;
      --) shift; break;;
      -*) echo "Unknown option: $1" >&2; usage; exit 2;;
      *)  ARGS+=("$1"); shift;;
    esac
  done
}

log()   { "$QUIET" && return 0; printf '%s\n' "$*"; }
debug() { "$VERBOSE" || return 0; printf 'DEBUG: %s\n' "$*"; }
die()   { printf 'ERROR: %s\n' "$*" >&2; exit 1; }

main() {
  parse_args "$@"
  # Implement your logic here
  log "All done"
}

trap 'ec="$?"; [[ "$ec" -ne 0 ]] && printf "Exit code: %s\n" "$ec" >&2' EXIT
main "$@"
```

## Summary

Start from the template above and adapt for your use case. Focus on:

1. **Safety first**: Use strict mode (`set -Eeuo pipefail`)
2. **Clear structure**: Separate parsing, logic, and error handling
3. **Good practices**: Quote variables, check commands exist, handle errors gracefully
4. **Practical examples**: Build up from simple to complex as your needs grow

This approach will help you create reliable, maintainable Bash scripts that follow industry best practices.
