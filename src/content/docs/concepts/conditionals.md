---
title: Conditionals
description: if/elif/else with test/[ and [[ for decision-making in scripts.
---

Conditionals in Bash allow scripts to make decisions based on conditions. Understanding exit codes and different test methods is crucial.

## Exit Status Fundamentals

Bash conditionals are based on exit status (return codes):
- **0 = success/true** - condition met
- **Non-zero = failure/false** - condition not met

```bash
# Commands return exit status
ls /existing/path    # Returns 0 (success)
ls /missing/path     # Returns non-zero (failure)

# Check last command's exit status
echo $?              # Shows exit code of previous command
```

## Basic if Statements

```bash
# Simple if statement
if command; then
    echo "Command succeeded"
fi

# if-else
if [[ -f "config.txt" ]]; then
    echo "Config file exists"
else
    echo "Config file missing"
fi

# if-elif-else
if [[ "$user" == "admin" ]]; then
    echo "Administrator access"
elif [[ "$user" == "user" ]]; then
    echo "Regular user access"
else
    echo "Unknown user"
fi
```

## Test Commands: `[` vs `[[`

### POSIX Test `[` (and `test`)

The `[` command (same as `test`) is POSIX-compliant:

```bash
# File tests
if [ -f "$file" ]; then echo "Regular file"; fi
if [ -d "$dir" ]; then echo "Directory"; fi
if [ -r "$file" ]; then echo "Readable"; fi
if [ -w "$file" ]; then echo "Writable"; fi
if [ -x "$file" ]; then echo "Executable"; fi
if [ -e "$path" ]; then echo "Exists"; fi

# String tests
if [ -z "$string" ]; then echo "String is empty"; fi
if [ -n "$string" ]; then echo "String is not empty"; fi
if [ "$str1" = "$str2" ]; then echo "Strings equal"; fi
if [ "$str1" != "$str2" ]; then echo "Strings not equal"; fi

# Numeric tests
if [ "$num1" -eq "$num2" ]; then echo "Numbers equal"; fi
if [ "$num1" -ne "$num2" ]; then echo "Numbers not equal"; fi
if [ "$num1" -lt "$num2" ]; then echo "num1 less than num2"; fi
if [ "$num1" -le "$num2" ]; then echo "num1 less or equal"; fi
if [ "$num1" -gt "$num2" ]; then echo "num1 greater than num2"; fi
if [ "$num1" -ge "$num2" ]; then echo "num1 greater or equal"; fi
```

### Bash Enhanced Test `[[`

The `[[` construct is a Bash enhancement with more features:

```bash
# Pattern matching
if [[ "$filename" == *.txt ]]; then
    echo "Text file"
fi

# Regular expressions
if [[ "$email" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
    echo "Valid email format"
fi

# Safer string comparisons (no word splitting)
if [[ $string == "hello world" ]]; then
    echo "Match - no need to quote variables in [["
fi

# Logical operators
if [[ "$user" == "admin" && "$pass" == "secret" ]]; then
    echo "Admin authenticated"
fi

if [[ "$file" == *.log || "$file" == *.txt ]]; then
    echo "Log or text file"
fi
```

## File Test Operators

Common file test operators for both `[` and `[[`:

```bash
# File type tests
-f file    # Regular file
-d file    # Directory
-L file    # Symbolic link
-S file    # Socket
-p file    # Named pipe (FIFO)
-c file    # Character device
-b file    # Block device

# Permission tests
-r file    # Readable
-w file    # Writable
-x file    # Executable
-u file    # Set-user-ID bit set
-g file    # Set-group-ID bit set
-k file    # Sticky bit set

# File comparison
file1 -nt file2    # file1 newer than file2
file1 -ot file2    # file1 older than file2
file1 -ef file2    # Same device and inode

# Existence and size
-e file    # Exists
-s file    # Exists and not empty
```

## Advanced Conditional Patterns

### Multiple Conditions

```bash
# Complex file validation
validate_config() {
    local config="$1"
    
    if [[ -f "$config" && -r "$config" ]]; then
        if [[ -s "$config" ]]; then
            echo "Config file is valid"
            return 0
        else
            echo "Config file is empty" >&2
            return 1
        fi
    else
        echo "Config file missing or unreadable" >&2
        return 1
    fi
}
```

### Case-Based Conditionals

For multiple discrete options, `case` is often cleaner than `if-elif`:

```bash
handle_signal() {
    local signal="$1"
    
    case "$signal" in
        TERM|QUIT)
            echo "Graceful shutdown"
            cleanup_and_exit
            ;;
        HUP)
            echo "Reloading configuration"
            reload_config
            ;;
        USR1)
            echo "Rotating logs"
            rotate_logs
            ;;
        *)
            echo "Unknown signal: $signal" >&2
            ;;
    esac
}
```

### Conditional Assignment

```bash
# Set default values conditionally
config_file="${CONFIG_FILE:-/etc/app.conf}"

# Conditional assignment with test
if [[ -z "$EDITOR" ]]; then
    EDITOR="nano"
fi

# Or more concisely
: "${EDITOR:=nano}"
```

## Best Practices

### 1. Always Quote Variables in `[`

```bash
# Good: quoted variables
if [ "$var" = "value" ]; then
    echo "Match"
fi

# Bad: unquoted (can break with spaces/special chars)
if [ $var = value ]; then
    echo "Risky"
fi
```

### 2. Prefer `[[` for Bash Scripts

```bash
# Preferred: safer and more features
if [[ "$path" == /home/* ]]; then
    echo "In home directory"
fi

# POSIX compatible but more verbose
if [ "${path#/home/}" != "$path" ]; then
    echo "In home directory"
fi
```

### 3. Use Meaningful Error Messages

```bash
validate_input() {
    local input="$1"
    
    if [[ -z "$input" ]]; then
        echo "Error: Input cannot be empty" >&2
        return 1
    fi
    
    if [[ ! "$input" =~ ^[a-zA-Z0-9_-]+$ ]]; then
        echo "Error: Input must contain only letters, numbers, underscores, and hyphens" >&2
        return 1
    fi
    
    return 0
}
```

### 4. Combine Tests Logically

```bash
# Check if user can modify file
can_modify() {
    local file="$1"
    
    if [[ -f "$file" && -w "$file" ]]; then
        return 0
    elif [[ ! -e "$file" && -w "$(dirname "$file")" ]]; then
        # File doesn't exist but directory is writable
        return 0
    else
        return 1
    fi
}
```

## Common Patterns

### Input Validation

```bash
validate_email() {
    local email="$1"
    
    if [[ "$email" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
        return 0
    else
        echo "Invalid email format: $email" >&2
        return 1
    fi
}
```

### Environment Checks

```bash
check_requirements() {
    local missing=()
    
    # Check required commands
    for cmd in git curl jq; do
        if ! command -v "$cmd" >/dev/null 2>&1; then
            missing+=("$cmd")
        fi
    done
    
    if [[ ${#missing[@]} -gt 0 ]]; then
        echo "Missing required commands: ${missing[*]}" >&2
        return 1
    fi
    
    # Check environment variables
    if [[ -z "$API_KEY" ]]; then
        echo "API_KEY environment variable not set" >&2
        return 1
    fi
    
    return 0
}
```

Conditionals are fundamental to creating intelligent scripts that can adapt to different situations and handle errors gracefully.
