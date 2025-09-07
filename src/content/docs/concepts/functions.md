---
title: Functions
description: Declare, call, pass arguments, and manage scope and return values.
---

Functions in Bash allow you to group commands into reusable blocks. They help organize code, reduce repetition, and create modular scripts.

## Function Declaration

There are two ways to declare functions:

```bash
# Method 1: Traditional syntax
function greet() {
    echo "Hello, $1!"
}

# Method 2: POSIX syntax (preferred)
greet() {
    echo "Hello, $1!"
}

# Multi-line functions
process_files() {
    local dir="$1"
    local pattern="$2"
    
    find "$dir" -name "$pattern" -type f | while read -r file; do
        echo "Processing: $file"
        # Process file here
    done
}
```

## Function Arguments

Functions receive arguments through positional parameters:

```bash
backup_file() {
    local source_file="$1"
    local backup_dir="${2:-./backups}"
    local timestamp=$(date +%Y%m%d_%H%M%S)
    
    # Validate required arguments
    if [[ $# -eq 0 ]]; then
        echo "Usage: backup_file <file> [backup_dir]" >&2
        return 1
    fi
    
    # Create backup
    cp "$source_file" "$backup_dir/$(basename "$source_file")_$timestamp"
}

# Function calls
backup_file "important.txt"
backup_file "config.conf" "/safe/location"
```

### Working with All Arguments

```bash
show_args() {
    echo "Function name: $0"
    echo "First argument: $1"
    echo "Second argument: $2"
    echo "All arguments: $*"        # Single string
    echo "All arguments: $@"        # Separate words
    echo "Number of arguments: $#"
}

# Iterate over all arguments
process_all() {
    for arg in "$@"; do
        echo "Processing: $arg"
    done
}
```

## Variable Scope

### Local Variables

Always use `local` for function variables to avoid polluting global scope:

```bash
calculate_sum() {
    local num1="$1"
    local num2="$2"
    local result=$((num1 + num2))
    
    echo "$result"
}

# Without local (bad practice)
bad_function() {
    temp_var="This pollutes global scope"  # Global variable
    echo "$temp_var"
}

# With local (good practice)
good_function() {
    local temp_var="This stays local"      # Local variable
    echo "$temp_var"
}
```

### Array Variables

Local arrays must be declared properly:

```bash
process_items() {
    local -a items=("$@")           # Copy arguments to local array
    local -a results=()             # Empty local array
    
    for item in "${items[@]}"; do
        # Process each item
        results+=("processed_$item")
    done
    
    printf '%s\n' "${results[@]}"
}
```

## Return Values

Functions can return exit codes and output data:

### Exit Codes

```bash
validate_file() {
    local file="$1"
    
    if [[ ! -f "$file" ]]; then
        echo "Error: File does not exist" >&2
        return 1        # Error exit code
    fi
    
    if [[ ! -r "$file" ]]; then
        echo "Error: File not readable" >&2
        return 2        # Different error code
    fi
    
    return 0            # Success
}

# Check function result
if validate_file "myfile.txt"; then
    echo "File is valid"
else
    echo "Validation failed with code: $?"
fi
```

### Returning Data

Functions return data via stdout (echo/printf):

```bash
get_file_extension() {
    local filename="$1"
    local extension="${filename##*.}"
    
    # Return extension via stdout
    echo "$extension"
}

# Capture function output
file_ext=$(get_file_extension "document.pdf")
echo "Extension is: $file_ext"

# Return multiple values
get_file_info() {
    local file="$1"
    local size=$(stat -c%s "$file" 2>/dev/null || echo "0")
    local modified=$(stat -c%Y "$file" 2>/dev/null || echo "0")
    
    # Return multiple values separated by newlines
    printf '%s\n' "$size" "$modified"
}

# Capture multiple return values
{
    read -r file_size
    read -r file_time
} < <(get_file_info "example.txt")
```

## Advanced Function Techniques

### Default Parameters

```bash
create_user() {
    local username="$1"
    local home_dir="${2:-/home/$username}"      # Default home directory
    local shell="${3:-/bin/bash}"               # Default shell
    local group="${4:-users}"                   # Default group
    
    echo "Creating user: $username"
    echo "Home: $home_dir"
    echo "Shell: $shell"
    echo "Group: $group"
}

# Calls with different parameter combinations
create_user "alice"                             # Use all defaults
create_user "bob" "/custom/home/bob"            # Custom home
create_user "charlie" "" "/bin/zsh" "admin"    # Custom shell and group
```

### Parameter Validation

```bash
robust_function() {
    # Validate parameter count
    if [[ $# -lt 2 ]]; then
        echo "Usage: robust_function <param1> <param2> [param3]" >&2
        return 1
    fi
    
    local param1="$1"
    local param2="$2"
    local param3="${3:-default_value}"
    
    # Validate parameter types/values
    if [[ ! "$param1" =~ ^[0-9]+$ ]]; then
        echo "Error: param1 must be a number" >&2
        return 1
    fi
    
    if [[ "$param2" != "option1" && "$param2" != "option2" ]]; then
        echo "Error: param2 must be 'option1' or 'option2'" >&2
        return 1
    fi
    
    echo "Parameters are valid: $param1, $param2, $param3"
}
```

### Recursive Functions

```bash
factorial() {
    local n="$1"
    
    # Base case
    if [[ "$n" -le 1 ]]; then
        echo 1
        return
    fi
    
    # Recursive case
    local prev_result
    prev_result=$(factorial $((n - 1)))
    echo $((n * prev_result))
}

# Calculate factorial
result=$(factorial 5)
echo "5! = $result"
```

## Function Libraries

Create reusable function libraries:

```bash
# File: lib/utils.sh
#!/bin/bash

log_info() {
    echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') - $*"
}

log_error() {
    echo "[ERROR] $(date '+%Y-%m-%d %H:%M:%S') - $*" >&2
}

is_number() {
    [[ "$1" =~ ^[0-9]+$ ]]
}

# File: main.sh
#!/bin/bash

# Source the library
source "lib/utils.sh"

# Use library functions
log_info "Starting application"

if is_number "$1"; then
    log_info "Argument is a number: $1"
else
    log_error "Argument is not a number: $1"
fi
```

## Best Practices

1. **Use `local` for all function variables**
2. **Validate parameters early**
3. **Use descriptive function names**
4. **Keep functions focused and small**
5. **Document complex functions**
6. **Handle errors gracefully**

```bash
# Example of good function practices
convert_temperature() {
    # Convert temperature between Celsius and Fahrenheit
    # Usage: convert_temperature <value> <from_unit> <to_unit>
    
    local value="$1"
    local from_unit="$2"
    local to_unit="$3"
    local result
    
    # Validate arguments
    if [[ $# -ne 3 ]]; then
        echo "Usage: convert_temperature <value> <from_unit> <to_unit>" >&2
        return 1
    fi
    
    if [[ ! "$value" =~ ^-?[0-9]+(\.[0-9]+)?$ ]]; then
        echo "Error: Value must be a number" >&2
        return 1
    fi
    
    # Perform conversion
    case "${from_unit}_${to_unit}" in
        "C_F")
            result=$(echo "$value * 9 / 5 + 32" | bc -l)
            ;;
        "F_C")
            result=$(echo "($value - 32) * 5 / 9" | bc -l)
            ;;
        *)
            echo "Error: Unsupported conversion: $from_unit to $to_unit" >&2
            return 1
            ;;
    esac
    
    printf "%.2f\n" "$result"
}
```

Functions are essential for creating maintainable and reusable Bash scripts. They help organize code and make complex tasks manageable.
