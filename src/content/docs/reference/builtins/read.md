---
title: read
description: Read a line from standard input into variables.
---

The `read` builtin reads a line from standard input and splits it into fields, assigning each field to a variable. It's essential for creating interactive scripts and processing input.

## Synopsis

```
read [-ers] [-a array] [-d delim] [-i text] [-n nchars] 
     [-N nchars] [-p prompt] [-t timeout] [-u fd] [name ...]
```

## Parameters

### Options
- `-a array`: Assign words to array elements instead of variables
- `-d delim`: Use `delim` as line delimiter instead of newline
- `-e`: Use readline for input (interactive editing)
- `-i text`: Use `text` as initial text for readline
- `-n nchars`: Return after reading `nchars` characters
- `-N nchars`: Return after reading exactly `nchars` characters
- `-p prompt`: Display `prompt` on stderr before reading
- `-r`: Raw mode - backslash does not escape characters
- `-s`: Silent mode - do not echo characters (for passwords)
- `-t timeout`: Time out after `timeout` seconds
- `-u fd`: Read from file descriptor `fd` instead of stdin

### Arguments
- `name ...`: Variable names to store the input fields

## Return Codes

- `0`: Successful read
- `1`: EOF encountered or timeout occurred
- `>1`: Read error or invalid option

## Minimal Examples

```bash
# Basic input
echo -n "Enter your name: "
read name
echo "Hello, $name!"

# With prompt
read -p "Enter password: " -s password
echo  # Add newline after silent input

# Read into array
read -a words <<< "apple banana cherry"
echo "First word: ${words[0]}"

# Read from file
read -r line < /etc/hostname
echo "Hostname: $line"
```

## Common Patterns

### Interactive Input
```bash
# Simple prompts
read -p "Continue? (y/n): " answer
case "$answer" in
    [Yy]*) echo "Continuing..." ;;
    [Nn]*) echo "Aborted." ; exit 1 ;;
    *) echo "Please answer yes or no." ;;
esac

# Password input
read -p "Username: " username
read -p "Password: " -s password
echo  # New line after password
```

### File Processing
```bash
# Read file line by line (best practice)
while IFS= read -r line; do
    echo "Processing: $line"
done < "input.txt"

# Read with custom delimiter
while IFS=':' read -r user pass uid gid info home shell; do
    echo "User: $user, Home: $home"
done < /etc/passwd

# Skip empty lines
while IFS= read -r line; do
    [[ -n "$line" ]] || continue
    echo "Non-empty: $line"
done < "file.txt"
```

### Advanced Usage
```bash
# Timeout handling
if read -t 10 -p "Enter choice (10s timeout): " choice; then
    echo "You chose: $choice"
else
    echo "Timeout or error occurred"
fi

# Read single character
read -n 1 -p "Press any key to continue..."
echo

# Read exactly N characters
read -N 4 -p "Enter 4-digit PIN: " pin
echo "PIN entered: $pin"

# Read from custom file descriptor
exec 3< input.txt
read -u 3 first_line
exec 3<&-
```

### CSV Processing
```bash
# Simple CSV parsing
while IFS=',' read -r name email department; do
    echo "Employee: $name"
    echo "  Email: $email"  
    echo "  Department: $department"
    echo "---"
done < employees.csv

# Handle quoted CSV (basic)
process_csv_line() {
    local line="$1"
    # Remove quotes and split
    line="${line//\"/}"
    IFS=',' read -ra fields <<< "$line"
    printf 'Field %d: %s\n' "${!fields[@]}" "${fields[@]}"
}
```

## Best Practices

### Always Use -r Flag
```bash
# Good: prevents backslash interpretation
while IFS= read -r line; do
    echo "$line"
done < file.txt

# Bad: backslashes may be interpreted
while IFS= read line; do
    echo "$line"
done < file.txt
```

### Preserve Whitespace
```bash
# Good: preserves leading/trailing whitespace
while IFS= read -r line; do
    process "$line"
done

# Bad: may lose whitespace
while read -r line; do
    process "$line"  
done
```

### Error Handling
```bash
# Check read success
if read -p "Enter value: " value; then
    echo "Got: $value"
else
    echo "Read failed or EOF" >&2
    exit 1
fi

# Timeout with fallback
if ! read -t 30 -p "Enter config path: " config_path; then
    config_path="/etc/default.conf"
    echo "Using default: $config_path"
fi
```

## Notes

- **Raw mode (-r)**: Always use `-r` unless you specifically need backslash processing
- **IFS**: Set `IFS=` to preserve leading/trailing whitespace when reading lines
- **Arrays**: Use `-a` to read into array elements instead of separate variables
- **Security**: Use `-s` for password input to prevent echoing to terminal
- **EOF detection**: `read` returns non-zero on EOF, useful for loop termination
- **File descriptors**: Use `-u` to read from custom file descriptors

## See Also

- Related builtins: [`echo`](/reference/builtins/echo/), [`declare`](/reference/builtins/declare/)
- Related concepts: [Variables](/concepts/variables/), [File Operations](/concepts/file-operations/)
