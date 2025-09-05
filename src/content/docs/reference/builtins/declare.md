---
title: declare
description: Set variable attributes and declare variables with specific properties.
---

The `declare` builtin sets variable attributes and optionally assigns values. It's used to create arrays, set variable types, and control variable scope and behavior.

## Synopsis

```
declare [-aAfFgilnrtux] [-p] [name[=value] ...]
```

## Parameters

### Type Attributes
- `-a`: Create indexed array
- `-A`: Create associative array  
- `-i`: Treat as integer (arithmetic context)
- `-l`: Convert to lowercase on assignment
- `-u`: Convert to uppercase on assignment

### Scope and Access
- `-g`: Create global variables (even inside functions)
- `-n`: Create nameref (reference to another variable)
- `-r`: Make variable readonly
- `-x`: Export to environment (same as `export`)

### Display Options
- `-p`: Display variable declarations
- `-F`: Display function names only
- `-f`: Display function definitions

### Other
- `-t`: Trace function calls (for functions)

## Return Codes

- `0`: Success
- `1`: Invalid option or assignment error
- `2`: Read-only variable assignment attempted

## Minimal Examples

```bash
# Basic variable declaration
declare name="Alice"
declare -i age=30

# Arrays
declare -a fruits=("apple" "banana" "cherry")
declare -A config=([host]="localhost" [port]="8080")

# Display declarations
declare -p name age
declare -p fruits config

# Export to environment
declare -x PATH="/usr/local/bin:$PATH"
```

## Array Operations

### Indexed Arrays
```bash
# Create and populate
declare -a numbers=(1 2 3 4 5)
declare -a files

# Add elements
files[0]="file1.txt"
files[1]="file2.txt" 
files+=("file3.txt")  # Append

# Access elements
echo "First: ${numbers[0]}"
echo "All: ${numbers[@]}"
echo "Count: ${#numbers[@]}"

# Iterate
for num in "${numbers[@]}"; do
    echo "Number: $num"
done
```

### Associative Arrays
```bash
# Create and populate
declare -A user=(
    [name]="John Doe"
    [email]="john@example.com"
    [role]="admin"
)

# Add/modify entries
user[status]="active"
user[login_count]=42

# Access entries
echo "Name: ${user[name]}"
echo "Email: ${user[email]}"

# Get all keys and values
echo "Keys: ${!user[@]}"
echo "Values: ${user[@]}"

# Iterate over associative array
for key in "${!user[@]}"; do
    echo "$key: ${user[$key]}"
done
```

## Variable Attributes

### Integer Variables
```bash
# Declare as integer
declare -i count=0
declare -i result

# Arithmetic operations (no $ needed)
count=count+1
result=10*5+2
echo "Count: $count"      # 1
echo "Result: $result"    # 52

# Invalid assignment becomes 0
declare -i num="hello"    # num becomes 0
```

### Case Conversion
```bash
# Uppercase
declare -u upper_var="hello world"
echo "$upper_var"         # HELLO WORLD

# Lowercase  
declare -l lower_var="HELLO WORLD"
echo "$lower_var"         # hello world

# Assignment triggers conversion
upper_var="new text"
echo "$upper_var"         # NEW TEXT
```

### Readonly Variables
```bash
# Make readonly
declare -r PI=3.14159
declare -r SCRIPT_NAME="backup.sh"

# Cannot be changed (will cause error)
# PI=3.14  # bash: PI: readonly variable

# Check readonly status
declare -p PI             # declare -r PI="3.14159"
```

## Advanced Usage

### Namerefs (Variable References)
```bash
# Create reference to another variable
original="Hello World"
declare -n ref=original

echo "$ref"               # Hello World
ref="Modified"
echo "$original"          # Modified

# Useful for indirect access
get_config() {
    local -n config_ref=$1
    config_ref[database]="mysql"
    config_ref[host]="localhost"
}

declare -A app_config
get_config app_config
echo "${app_config[database]}"  # mysql
```

### Function Scope
```bash
# Global variables (default)
declare global_var="I am global"

function demo_scope() {
    # Local to function
    declare local_var="I am local"
    
    # Force global from within function
    declare -g forced_global="I am global too"
    
    echo "Inside function:"
    echo "  Local: $local_var"
    echo "  Global: $global_var"
}

demo_scope
echo "Outside function:"
echo "  Global: $global_var"
echo "  Forced: $forced_global"
# echo "$local_var"  # Would be empty
```

### Displaying Declarations
```bash
# Show all variables
declare -p

# Show specific variables
declare -p HOME PATH USER

# Show only functions
declare -F

# Show function definitions
declare -f function_name

# Show arrays
declare -a | grep "^declare -a"  # Indexed arrays
declare -A | grep "^declare -A"  # Associative arrays
```

## Common Patterns

### Configuration Management
```bash
# Application configuration
declare -A config=(
    [debug]="false"
    [log_level]="info"
    [max_connections]="100"
)

# Load from file
load_config() {
    local config_file="$1"
    local -n cfg=$2
    
    while IFS='=' read -r key value; do
        [[ "$key" =~ ^[[:space:]]*# ]] && continue
        [[ -z "$key" ]] && continue
        cfg["$key"]="$value"
    done < "$config_file"
}

declare -A app_config
load_config "app.conf" app_config
```

### Type Safety
```bash
# Ensure integer operations
validate_number() {
    local -i num="$1"
    if [[ "$1" != "$num" ]]; then
        echo "Error: '$1' is not a valid number" >&2
        return 1
    fi
    echo "$num"
}

# Usage
if result=$(validate_number "$user_input"); then
    echo "Valid number: $result"
else
    echo "Invalid input"
fi
```

### Environment Management
```bash
# Setup environment with type safety
setup_environment() {
    # Required integer values
    declare -xi MAX_WORKERS="${MAX_WORKERS:-4}"
    declare -xi TIMEOUT="${TIMEOUT:-30}"
    
    # Required string values (uppercase)
    declare -xu LOG_LEVEL="${LOG_LEVEL:-INFO}"
    declare -xu APP_NAME="${APP_NAME:-MyApp}"
    
    # Readonly configuration
    declare -r CONFIG_DIR="/etc/${APP_NAME,,}"
    declare -r PID_FILE="/var/run/${APP_NAME,,}.pid"
    
    echo "Environment configured:"
    declare -p MAX_WORKERS TIMEOUT LOG_LEVEL APP_NAME CONFIG_DIR PID_FILE
}
```

## Notes

- **Synonym**: `typeset` is a synonym for `declare` (from ksh compatibility)
- **Local scope**: In functions, `declare` creates local variables by default
- **Global forcing**: Use `-g` to create global variables from within functions  
- **Attribute inheritance**: Array elements don't inherit parent array attributes
- **Performance**: Integer variables (`-i`) can be faster for arithmetic
- **Debugging**: Use `declare -p` to inspect variable attributes and values

## See Also

- Related builtins: [`local`](/reference/builtins/local/), [`export`](/reference/builtins/export/), [`readonly`](/reference/builtins/readonly/)
- Related concepts: [Variables](/concepts/variables/), [Functions](/concepts/functions/)
