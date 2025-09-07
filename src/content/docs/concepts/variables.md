---
title: Variables
description: Shell parameters, scope, arrays, and expansion basics.
---

Variables in Bash store data and are fundamental to shell scripting. Understanding variable assignment, expansion, and scoping is essential.

## Basic Assignment

Variables are assigned without spaces around the equals sign:

```bash
name="Alice"
count=42
path="/home/user"
```

## Expansion & Quoting

Always quote variables to prevent word splitting and globbing:

```bash
# Good: quotes preserve spaces and prevent globbing
echo "Hello, $name"
cp "$file" "$destination"

# Bad: unquoted variables can break on spaces
echo Hello, $name        # May split on spaces
cp $file $destination    # Dangerous with special characters
```

## Parameter Expansion

Bash provides powerful parameter expansion features:

```bash
# Basic expansion
echo "$var"

# Default values
echo "${name:-Anonymous}"      # Use "Anonymous" if name is unset
echo "${config:=default.conf}" # Set and use default if unset

# String manipulation
file="/path/to/document.txt"
echo "${file##*/}"        # Extract filename: document.txt
echo "${file%.*}"         # Remove extension: /path/to/document
echo "${file/txt/pdf}"    # Replace first: /path/to/document.pdf
echo "${file//o/0}"       # Replace all 'o' with '0'

# Length and substrings
echo "${#name}"           # Length of variable
echo "${path:0:5}"        # First 5 characters
echo "${path:5}"          # From 5th character to end
```

## Environment Variables

Export variables to make them available to child processes:

```bash
# Local to current shell
local_var="value"

# Available to child processes
export GLOBAL_VAR="value"

# Or combine declaration and export
export PATH="/usr/local/bin:$PATH"
```

## Arrays

Bash supports both indexed and associative arrays.

### Indexed Arrays

```bash
# Declaration and assignment
fruits=("apple" "banana" "cherry")
numbers=(1 2 3 4 5)

# Access elements
echo "${fruits[0]}"        # First element: apple
echo "${fruits[@]}"        # All elements
echo "${#fruits[@]}"       # Number of elements

# Add elements
fruits+=("date")           # Append element
fruits[10]="elderberry"    # Assign to specific index
```

### Associative Arrays

```bash
# Declare associative array
declare -A config
config[host]="example.com"
config[port]="8080"
config[ssl]="true"

# Or declare and assign together
declare -A user=(
    [name]="Ada"
    [email]="ada@example.com"
    [role]="admin"
)

# Access and iterate
echo "${config[host]}"     # Access by key

# All keys and values
echo "${!config[@]}"       # All keys
echo "${config[@]}"        # All values

# Iterate over associative array
for key in "${!user[@]}"; do
    echo "$key: ${user[$key]}"
done
```

## Variable Scope

### Global Scope
Variables are global by default:

```bash
global_var="I am global"

function show_global() {
    echo "$global_var"     # Can access global variables
    global_var="Modified"  # Modifies global variable
}
```

### Local Scope
Use `local` to create function-scoped variables:

```bash
function process_data() {
    local temp_file="/tmp/processing.$$"
    local counter=0
    
    # These variables don't affect global scope
    for item in "$@"; do
        echo "Processing: $item" > "$temp_file"
        ((counter++))
    done
    
    echo "Processed $counter items"
    rm -f "$temp_file"
}
```

## Special Variables

Bash provides several built-in variables:

```bash
echo "Script name: $0"
echo "First argument: $1"
echo "All arguments: $@"
echo "Number of arguments: $#"
echo "Last command exit status: $?"
echo "Current process ID: $$"
echo "Last background job PID: $!"
```

## Best Practices

1. **Always quote variables**: Use `"$var"` instead of `$var`
2. **Use meaningful names**: `user_count` not `uc`
3. **Use `local` in functions**: Prevent unintended side effects
4. **Initialize arrays properly**: `arr=()` for empty array
5. **Check if variables are set**: Use `${var:-default}` or `[[ -v var ]]`

```bash
# Good variable practices
process_file() {
    local input_file="$1"
    local output_dir="${2:-./output}"
    local -a processed_files=()
    
    # Validate required parameters
    if [[ -z "$input_file" ]]; then
        echo "Error: input file required" >&2
        return 1
    fi
    
    # Process with quoted variables
    if [[ -f "$input_file" ]]; then
        cp "$input_file" "$output_dir/"
        processed_files+=("$input_file")
    fi
    
    echo "Processed ${#processed_files[@]} files"
}
```

Variables form the foundation of effective Bash scripting. Master these concepts to write robust, maintainable scripts.
