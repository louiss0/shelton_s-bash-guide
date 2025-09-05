---
title: if
description: Conditional execution block for decision-making in scripts.
---

The `if` keyword creates conditional execution blocks that run commands based on the success or failure of test conditions. It's fundamental to creating intelligent scripts that adapt to different situations.

## Synopsis

```
if list; then 
    list
[elif list; then 
    list] ...
[else 
    list]
fi
```

## Behavior

- Executes the first `list` after `if`
- If the exit status is 0 (success), executes commands after `then`
- If non-zero (failure), checks `elif` conditions or executes `else` block
- The `fi` keyword marks the end of the conditional block

## Return Codes

The exit status of an `if` statement is the exit status of the last command executed in the chosen branch, or 0 if no condition was true and there's no `else` clause.

## Basic Examples

### Simple if Statement

```bash
if grep -q "error" logfile.txt; then
    echo "Errors found in log!"
fi
```

### if-else

```bash
if [[ -f "config.txt" ]]; then
    echo "Config file exists"
else
    echo "Config file missing"
fi
```

### if-elif-else Chain

```bash
if [[ "$1" == "start" ]]; then
    echo "Starting service..."
elif [[ "$1" == "stop" ]]; then
    echo "Stopping service..."
elif [[ "$1" == "restart" ]]; then
    echo "Restarting service..."
else
    echo "Usage: $0 {start|stop|restart}"
    exit 1
fi
```

## Common Test Patterns

### File Tests

```bash
# File existence and type
if [[ -f "$file" ]]; then
    echo "Regular file exists"
elif [[ -d "$file" ]]; then
    echo "Directory exists"
elif [[ -e "$file" ]]; then
    echo "File exists but not regular file or directory"
else
    echo "File does not exist"
fi

# Permission tests
if [[ -r "$file" && -w "$file" ]]; then
    echo "File is readable and writable"
fi

# File comparison
if [[ "$file1" -nt "$file2" ]]; then
    echo "$file1 is newer than $file2"
fi
```

### String Tests

```bash
# String comparison
if [[ "$user" == "admin" ]]; then
    echo "Administrator access granted"
fi

# Pattern matching
if [[ "$filename" == *.txt ]]; then
    echo "Text file detected"
fi

# Regular expressions
if [[ "$email" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
    echo "Valid email format"
fi

# String length
if [[ -n "$variable" ]]; then
    echo "Variable is not empty"
fi
```

### Numeric Tests

```bash
# Numeric comparison
if [[ "$age" -ge 18 ]]; then
    echo "Adult"
else
    echo "Minor"
fi

# Multiple conditions
if [[ "$score" -ge 90 && "$score" -le 100 ]]; then
    echo "Excellent score!"
elif [[ "$score" -ge 70 ]]; then
    echo "Good score"
else
    echo "Needs improvement"
fi
```

### Command Success

```bash
# Command execution success
if command -v git > /dev/null 2>&1; then
    echo "Git is installed"
fi

# Pipeline success
if echo "test" | grep -q "test"; then
    echo "Pattern found"
fi

# Multiple commands
if mkdir -p "$directory" && cd "$directory"; then
    echo "Directory created and changed"
fi
```

## Advanced Patterns

### Nested Conditions

```bash
if [[ -f "$config_file" ]]; then
    if [[ -r "$config_file" ]]; then
        if [[ -s "$config_file" ]]; then
            echo "Config file is readable and not empty"
            source "$config_file"
        else
            echo "Config file is empty"
        fi
    else
        echo "Config file is not readable"
    fi
else
    echo "Config file does not exist"
fi
```

### Function-Based Tests

```bash
is_valid_ip() {
    local ip=$1
    [[ $ip =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]
}

is_port_open() {
    local host=$1 port=$2
    timeout 3 bash -c "echo > /dev/tcp/$host/$port" 2>/dev/null
}

# Usage
if is_valid_ip "$server_ip"; then
    if is_port_open "$server_ip" 80; then
        echo "Web server is accessible"
    else
        echo "Web server is not responding"
    fi
else
    echo "Invalid IP address"
fi
```

### Complex Condition Logic

```bash
# Multiple conditions with logical operators
if [[ "$USER" == "root" || "$EUID" -eq 0 ]]; then
    echo "Running as root"
fi

# Grouped conditions
if [[ ( "$OS" == "Linux" || "$OS" == "Darwin" ) && -x "/usr/bin/curl" ]]; then
    echo "curl is available on Unix-like system"
fi

# Negation
if [[ ! -d "$backup_dir" ]]; then
    mkdir -p "$backup_dir"
    echo "Backup directory created"
fi
```

## Best Practices

### 1. Use [[ ]] for Enhanced Tests

```bash
# Preferred: [[ ]] with enhanced features
if [[ "$var" =~ ^[0-9]+$ ]]; then
    echo "Variable is numeric"
fi

# POSIX compatible but limited: [ ]
if [ "$var" -eq "$var" ] 2>/dev/null; then
    echo "Variable is numeric"
fi
```

### 2. Always Quote Variables

```bash
# Good: quoted variables
if [[ "$filename" == *.txt ]]; then
    echo "Text file"
fi

# Bad: unquoted (can break with spaces)
if [[ $filename == *.txt ]]; then
    echo "Text file"
fi
```

### 3. Handle Edge Cases

```bash
# Robust file processing
process_file() {
    local file="$1"
    
    if [[ -z "$file" ]]; then
        echo "Error: No file specified" >&2
        return 1
    fi
    
    if [[ ! -e "$file" ]]; then
        echo "Error: File '$file' does not exist" >&2
        return 1
    fi
    
    if [[ ! -f "$file" ]]; then
        echo "Error: '$file' is not a regular file" >&2
        return 1
    fi
    
    if [[ ! -r "$file" ]]; then
        echo "Error: Cannot read '$file'" >&2
        return 1
    fi
    
    echo "Processing file: $file"
    # Process file here
}
```

### 4. Use Meaningful Exit Codes

```bash
validate_config() {
    local config="$1"
    
    if [[ ! -f "$config" ]]; then
        echo "Config file not found" >&2
        return 1
    fi
    
    if ! grep -q "^database_url=" "$config"; then
        echo "Missing database_url in config" >&2
        return 2
    fi
    
    if ! grep -q "^api_key=" "$config"; then
        echo "Missing api_key in config" >&2
        return 3
    fi
    
    return 0
}

# Usage with specific error handling
if ! validate_config "app.conf"; then
    case $? in
        1) echo "Please create app.conf file" ;;
        2) echo "Please add database_url to config" ;;
        3) echo "Please add api_key to config" ;;
    esac
    exit 1
fi
```

## Common Pitfalls

### 1. Assignment vs. Comparison

```bash
# Wrong: assignment in condition
if [[ $var = "value" ]]; then  # Single = is assignment in some contexts

# Right: use == for comparison
if [[ $var == "value" ]]; then
    echo "Match"
fi
```

### 2. Numeric vs. String Comparison

```bash
# Wrong: string comparison for numbers
if [[ "10" > "9" ]]; then      # False! String comparison: "10" < "9"
    echo "Ten is greater than nine"
fi

# Right: numeric comparison
if [[ 10 -gt 9 ]]; then        # True! Numeric comparison
    echo "Ten is greater than nine"
fi
```

### 3. Missing Quotes with Spaces

```bash
# Wrong: breaks with spaces
file="my file.txt"
if [[ -f $file ]]; then        # Breaks: treats "my" and "file.txt" separately
    echo "Found file"
fi

# Right: quoted variable
if [[ -f "$file" ]]; then      # Works correctly
    echo "Found file"
fi
```

## Performance Tips

```bash
# Efficient: test most likely conditions first
if [[ -f "$file" ]]; then
    if [[ -r "$file" ]]; then
        if [[ -s "$file" ]]; then
            process_file "$file"
        fi
    fi
fi

# Use command substitution sparingly in conditions
# Efficient: direct command test
if command -v git >/dev/null 2>&1; then
    git status
fi

# Less efficient: command substitution
if [[ -n "$(command -v git)" ]]; then
    git status
fi
```

## See Also

- Related keywords: [`elif`](/reference/keywords/elif/), [`else`](/reference/keywords/else/), [`fi`](/reference/keywords/fi/)
- Related concepts: [Conditionals](/concepts/conditionals/), [Functions](/concepts/functions/)
- Related builtins: [`test`](/reference/builtins/test/), [`[`](/reference/builtins/test/)
