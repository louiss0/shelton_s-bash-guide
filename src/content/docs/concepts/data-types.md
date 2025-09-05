---
title: Data Types
description: Understanding Bash's type system, strings, numbers, arrays, and type attributes.
---

Bash is a dynamically typed shell where everything is fundamentally a string, but you can apply attributes and use different contexts to work with various data types effectively.

## Core Principle: Everything is a String

By default, all variables in Bash are strings. The shell interprets and converts them based on context:

```bash
var="42"
echo $var        # Outputs: 42 (as string)
echo $((var + 8)) # Outputs: 50 (arithmetic context)
```

## String Types

### Basic Strings
```bash
name="John Doe"
path="/home/user"
empty=""
```

### Multi-line Strings
```bash
# Here-document
message=$(cat <<EOF
Line 1
Line 2
EOF
)

# Literal newlines
multiline="Line 1
Line 2"
```

### Special String Contexts
```bash
# Raw strings (single quotes)
raw='$HOME will not expand'

# Interpreted strings (double quotes)  
interpreted="$HOME will expand to: $HOME"

# ANSI-C strings
ansi=$'Line 1\nLine 2\ttabbed'
```

## Numeric Types

### Integer Context
Use `declare -i` or arithmetic contexts to work with integers:

```bash
declare -i count=10
count=count+5        # No $ needed in arithmetic context
echo $count          # Outputs: 15

# Arithmetic expansion
result=$((10 + 20))
echo $result         # Outputs: 30
```

### Floating Point
Bash doesn't handle floating point natively, but you can use external tools:

```bash
# Using bc for floating point math
result=$(echo "scale=2; 10.5 / 3" | bc)
echo $result         # Outputs: 3.50

# Using awk
result=$(awk "BEGIN {print 10.5 / 3}")
echo $result         # Outputs: 3.5
```

## Array Types

### Indexed Arrays
Zero-based arrays with numeric indices:

```bash
# Declaration and assignment
declare -a fruits=("apple" "banana" "cherry")

# Alternative syntax
colors[0]="red"
colors[1]="green"  
colors[3]="blue"   # Note: index 2 is unset

# Access elements
echo ${fruits[0]}     # Outputs: apple
echo ${fruits[@]}     # All elements: apple banana cherry
echo ${#fruits[@]}    # Length: 3
```

### Associative Arrays
Key-value pairs with string keys:

```bash
# Must declare first
declare -A user=(
  [name]="Alice"
  [age]="30"
  [city]="New York"
)

# Access by key
echo ${user[name]}    # Outputs: Alice
echo ${user[@]}       # All values: Alice 30 New York
echo ${!user[@]}      # All keys: name age city
echo ${#user[@]}      # Length: 3
```

## Type Attributes with `declare`

### Common Attributes
```bash
declare -r readonly_var="cannot change"    # Read-only
declare -x exported_var="visible to children"  # Export
declare -u uppercase_var="hello"           # Auto-uppercase
declare -l lowercase_var="HELLO"           # Auto-lowercase
declare -i integer_var=42                  # Integer arithmetic
declare -a indexed_array                   # Indexed array
declare -A assoc_array                     # Associative array
```

### Combining Attributes
```bash
declare -rix PI=3.14159  # Read-only, integer, exported
declare -au names=("alice" "bob")  # Uppercase indexed array
```

## Type Testing and Validation

### Testing Variable Types
```bash
# Check if variable is set
if [[ -v var_name ]]; then
    echo "Variable is set"
fi

# Check if it's an array
if [[ "$(declare -p var_name 2>/dev/null)" =~ "declare -a" ]]; then
    echo "It's an indexed array"
elif [[ "$(declare -p var_name 2>/dev/null)" =~ "declare -A" ]]; then
    echo "It's an associative array"
fi
```

### Numeric Validation
```bash
# Check if string is a number
is_number() {
    [[ $1 =~ ^[+-]?[0-9]+([.][0-9]+)?$ ]]
}

if is_number "$input"; then
    echo "It's a number"
fi
```

## Type Conversion Examples

### String to Array
```bash
# Split string into array
IFS=',' read -ra parts <<< "one,two,three"
echo ${parts[1]}  # Outputs: two

# Word splitting
sentence="hello world bash"
words=($sentence)  # Creates array from words
```

### Array to String
```bash
fruits=("apple" "banana" "cherry")

# Join with spaces (default)
joined="${fruits[*]}"
echo "$joined"    # Outputs: apple banana cherry

# Join with custom delimiter
IFS=',' joined="${fruits[*]}"
echo "$joined"    # Outputs: apple,banana,cherry
```

## Best Practices

1. **Quote variables** to prevent word splitting: `"$var"`
2. **Use appropriate contexts** for operations: `$((math))` for arithmetic
3. **Declare array types** explicitly: `declare -A` for associative arrays
4. **Validate input** when expecting specific types
5. **Use `local`** in functions to avoid global variable pollution

```bash
process_data() {
    local -A config
    local -a results
    local -i count=0
    
    # Function logic here
}
```

## Common Gotchas

- **Unquoted variables** can split into multiple words
- **Array indices** can be sparse (gaps are allowed)
- **Associative arrays** require `declare -A` before use
- **Integer arithmetic** doesn't handle floating point
- **Empty vs unset** variables behave differently in tests
