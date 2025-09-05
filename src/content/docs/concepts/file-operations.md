---
title: File Operations
description: Redirection, reading files, and file tests for effective file manipulation.
---

File operations are fundamental to shell scripting. Bash provides powerful tools for redirecting input/output, reading files, and testing file properties.

## Redirection Basics

Redirection allows you to control where command input comes from and where output goes.

### Output Redirection

```bash
# Redirect stdout to file (overwrite)
echo "Hello World" > output.txt

# Append to file
echo "Second line" >> output.txt

# Redirect stderr to file
command_that_errors 2> error.log

# Redirect both stdout and stderr to file
command > output.log 2>&1

# Redirect both to same file (Bash 4+)
command &> output.log

# Discard output
command > /dev/null 2>&1
```

### Input Redirection

```bash
# Read from file
sort < unsorted.txt

# Here document
cat << EOF
This is a multi-line
here document
EOF

# Here string
grep "pattern" <<< "$variable_content"

# Process substitution
diff <(sort file1.txt) <(sort file2.txt)
```

### File Descriptors

```bash
# Custom file descriptors
exec 3> logfile.txt          # Open FD 3 for writing
echo "Log entry" >&3         # Write to FD 3
exec 3>&-                    # Close FD 3

# Read from custom FD
exec 4< input.txt            # Open FD 4 for reading
read -u 4 first_line         # Read from FD 4
exec 4<&-                    # Close FD 4
```

## Reading Files

### Line-by-Line Reading

```bash
# Best practice: preserve leading/trailing whitespace
while IFS= read -r line; do
    echo "Line: $line"
done < "input.txt"

# Read with line numbers
line_num=1
while IFS= read -r line; do
    printf "%3d: %s\n" "$line_num" "$line"
    ((line_num++))
done < "file.txt"

# Skip empty lines
while IFS= read -r line; do
    [[ -n "$line" ]] || continue
    echo "Non-empty line: $line"
done < "file.txt"
```

### CSV and Structured Data

```bash
# Read CSV file
while IFS=',' read -r name email department salary; do
    echo "Employee: $name"
    echo "  Email: $email"
    echo "  Department: $department"
    echo "  Salary: $salary"
    echo "---"
done < "employees.csv"

# Read with custom delimiter
while IFS=':' read -r user pass uid gid info home shell; do
    echo "User $user has home directory $home"
done < /etc/passwd

# Handle quoted CSV fields (basic)
parse_csv_line() {
    local line="$1"
    local -a fields=()
    
    # Simple CSV parser (doesn't handle all edge cases)
    IFS=',' read -ra fields <<< "$line"
    
    for field in "${fields[@]}"; do
        # Remove surrounding quotes if present
        field="${field#\"}"
        field="${field%\"}"
        echo "Field: $field"
    done
}
```

### Reading Entire Files

```bash
# Read entire file into variable
file_content=$(<file.txt)

# Read into array (one line per element)
readarray -t lines < file.txt
# or
mapfile -t lines < file.txt

# Process each line from array
for line in "${lines[@]}"; do
    echo "Line: $line"
done
```

## File Tests and Properties

### File Type Tests

```bash
check_file_type() {
    local file="$1"
    
    if [[ -f "$file" ]]; then
        echo "$file is a regular file"
    elif [[ -d "$file" ]]; then
        echo "$file is a directory"
    elif [[ -L "$file" ]]; then
        echo "$file is a symbolic link"
    elif [[ -p "$file" ]]; then
        echo "$file is a named pipe (FIFO)"
    elif [[ -S "$file" ]]; then
        echo "$file is a socket"
    elif [[ -c "$file" ]]; then
        echo "$file is a character device"
    elif [[ -b "$file" ]]; then
        echo "$file is a block device"
    elif [[ -e "$file" ]]; then
        echo "$file exists but is of unknown type"
    else
        echo "$file does not exist"
    fi
}
```

### Permission Tests

```bash
check_permissions() {
    local file="$1"
    
    echo "Checking permissions for: $file"
    
    [[ -r "$file" ]] && echo "  ✓ Readable" || echo "  ✗ Not readable"
    [[ -w "$file" ]] && echo "  ✓ Writable" || echo "  ✗ Not writable"
    [[ -x "$file" ]] && echo "  ✓ Executable" || echo "  ✗ Not executable"
    
    # Special permission bits
    [[ -u "$file" ]] && echo "  ✓ SUID bit set"
    [[ -g "$file" ]] && echo "  ✓ SGID bit set"
    [[ -k "$file" ]] && echo "  ✓ Sticky bit set"
}
```

### File Comparison

```bash
compare_files() {
    local file1="$1"
    local file2="$2"
    
    if [[ "$file1" -nt "$file2" ]]; then
        echo "$file1 is newer than $file2"
    elif [[ "$file1" -ot "$file2" ]]; then
        echo "$file1 is older than $file2"
    elif [[ "$file1" -ef "$file2" ]]; then
        echo "$file1 and $file2 are the same file (hard link)"
    else
        echo "Files have same modification time"
    fi
}
```

## Advanced File Operations

### Safe File Manipulation

```bash
# Create backup before modifying
safe_edit() {
    local file="$1"
    local backup="${file}.backup.$(date +%Y%m%d_%H%M%S)"
    
    # Verify file exists and is writable
    if [[ ! -f "$file" ]]; then
        echo "Error: $file does not exist" >&2
        return 1
    fi
    
    if [[ ! -w "$file" ]]; then
        echo "Error: $file is not writable" >&2
        return 1
    fi
    
    # Create backup
    cp "$file" "$backup" || {
        echo "Error: Failed to create backup" >&2
        return 1
    }
    
    echo "Backup created: $backup"
    # Safe to edit file now
}

# Atomic file replacement
atomic_write() {
    local target_file="$1"
    local temp_file="${target_file}.tmp.$$"
    
    # Write to temporary file first
    cat > "$temp_file" || {
        echo "Error: Failed to write temporary file" >&2
        rm -f "$temp_file"
        return 1
    }
    
    # Atomic move
    mv "$temp_file" "$target_file" || {
        echo "Error: Failed to move temporary file" >&2
        rm -f "$temp_file"
        return 1
    }
    
    echo "File updated atomically: $target_file"
}
```

### File Processing Patterns

```bash
# Process log files by date
process_logs_by_date() {
    local log_dir="$1"
    local target_date="$2"  # Format: YYYY-MM-DD
    
    find "$log_dir" -name "*.log" -type f | while read -r logfile; do
        # Get file modification date
        file_date=$(stat -c %y "$logfile" | cut -d' ' -f1)
        
        if [[ "$file_date" == "$target_date" ]]; then
            echo "Processing $logfile (modified on $file_date)"
            # Process the log file
            grep "ERROR" "$logfile" | wc -l
        fi
    done
}

# Archive old files
archive_old_files() {
    local source_dir="$1"
    local archive_dir="$2"
    local days_old="$3"
    
    # Create archive directory if it doesn't exist
    mkdir -p "$archive_dir"
    
    # Find files older than specified days
    find "$source_dir" -type f -mtime "+$days_old" -print0 | 
    while IFS= read -r -d '' file; do
        echo "Archiving: $file"
        # Move to archive with directory structure preserved
        relative_path="${file#$source_dir/}"
        archive_path="$archive_dir/$relative_path"
        
        # Create directory structure in archive
        mkdir -p "$(dirname "$archive_path")"
        mv "$file" "$archive_path"
    done
}
```

### Temporary Files

```bash
# Create secure temporary files
create_temp_file() {
    local template="${1:-temp.XXXXXX}"
    local temp_file
    
    # Create in /tmp with secure permissions
    temp_file=$(mktemp "/tmp/$template") || {
        echo "Error: Failed to create temporary file" >&2
        return 1
    }
    
    # Ensure cleanup on exit
    trap "rm -f '$temp_file'" EXIT
    
    echo "$temp_file"
}

# Working with temporary directories
work_with_temp_dir() {
    local temp_dir
    temp_dir=$(mktemp -d) || {
        echo "Error: Failed to create temporary directory" >&2
        return 1
    }
    
    # Ensure cleanup
    trap "rm -rf '$temp_dir'" EXIT
    
    echo "Working in: $temp_dir"
    
    # Do work in temporary directory
    cd "$temp_dir"
    echo "data" > work_file.txt
    ls -la
    
    # Cleanup happens automatically via trap
}
```

## File Monitoring

### Watch for File Changes

```bash
# Monitor file for changes
monitor_file() {
    local file="$1"
    local last_mod
    
    if [[ ! -f "$file" ]]; then
        echo "Error: $file does not exist" >&2
        return 1
    fi
    
    last_mod=$(stat -c %Y "$file")
    echo "Monitoring $file for changes..."
    
    while true; do
        current_mod=$(stat -c %Y "$file" 2>/dev/null || echo "0")
        
        if [[ "$current_mod" != "$last_mod" ]]; then
            echo "File changed: $file"
            last_mod="$current_mod"
            
            # Process the change
            echo "New content:"
            tail -5 "$file"
        fi
        
        sleep 2
    done
}

# Wait for file to appear
wait_for_file() {
    local file="$1"
    local timeout="${2:-30}"  # Default 30 seconds
    local count=0
    
    while [[ ! -f "$file" && $count -lt $timeout ]]; do
        echo "Waiting for $file... ($count/$timeout)"
        sleep 1
        ((count++))
    done
    
    if [[ -f "$file" ]]; then
        echo "File appeared: $file"
        return 0
    else
        echo "Timeout waiting for $file" >&2
        return 1
    fi
}
```

## Configuration File Handling

### Key-Value Configuration

```bash
# Read configuration file
load_config() {
    local config_file="$1"
    
    if [[ ! -f "$config_file" ]]; then
        echo "Warning: Config file $config_file not found" >&2
        return 1
    fi
    
    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        [[ "$key" =~ ^[[:space:]]*# ]] && continue
        [[ "$key" =~ ^[[:space:]]*$ ]] && continue
        
        # Trim whitespace
        key="${key//[[:space:]]/}"
        value="${value#"${value%%[![:space:]]*}"}"
        value="${value%"${value##*[![:space:]]}"}"
        
        # Remove quotes if present
        [[ "$value" =~ ^\".*\"$ ]] && value="${value:1:-1}"
        [[ "$value" =~ ^\'.*\'$ ]] && value="${value:1:-1}"
        
        # Export configuration variable
        declare -g "CONFIG_$key"="$value"
        echo "Loaded: CONFIG_$key=$value"
        
    done < "$config_file"
}

# Write configuration file
save_config() {
    local config_file="$1"
    local temp_file="${config_file}.tmp.$$"
    
    {
        echo "# Configuration file generated on $(date)"
        echo "# Edit with caution"
        echo
        
        # Save all CONFIG_* variables
        for var in $(compgen -v CONFIG_); do
            key="${var#CONFIG_}"
            value="${!var}"
            echo "$key=$value"
        done
        
    } > "$temp_file"
    
    # Atomic replacement
    mv "$temp_file" "$config_file" && echo "Configuration saved to $config_file"
}
```

## Best Practices

1. **Always test file existence** before operations
2. **Use proper quoting** for filenames with spaces
3. **Handle errors gracefully** with appropriate error messages
4. **Use atomic operations** for critical file updates
5. **Clean up temporary files** with traps
6. **Preserve file permissions** when appropriate

```bash
# Comprehensive file operation example
robust_file_processor() {
    local input_file="$1"
    local output_file="$2"
    
    # Validate inputs
    if [[ $# -ne 2 ]]; then
        echo "Usage: robust_file_processor <input> <output>" >&2
        return 1
    fi
    
    # Check input file
    if [[ ! -f "$input_file" ]]; then
        echo "Error: Input file '$input_file' does not exist" >&2
        return 1
    fi
    
    if [[ ! -r "$input_file" ]]; then
        echo "Error: Input file '$input_file' is not readable" >&2
        return 1
    fi
    
    # Check if we can create output file
    if [[ -e "$output_file" && ! -w "$output_file" ]]; then
        echo "Error: Output file '$output_file' is not writable" >&2
        return 1
    fi
    
    local output_dir
    output_dir=$(dirname "$output_file")
    if [[ ! -w "$output_dir" ]]; then
        echo "Error: Output directory '$output_dir' is not writable" >&2
        return 1
    fi
    
    # Create temporary file for safe processing
    local temp_file
    temp_file=$(mktemp) || {
        echo "Error: Failed to create temporary file" >&2
        return 1
    }
    
    # Ensure cleanup
    trap "rm -f '$temp_file'" EXIT
    
    echo "Processing '$input_file' -> '$output_file'"
    
    # Process file (example: add line numbers)
    local line_num=1
    while IFS= read -r line; do
        printf "%04d: %s\n" "$line_num" "$line"
        ((line_num++))
    done < "$input_file" > "$temp_file"
    
    # Atomic move to final location
    mv "$temp_file" "$output_file" && {
        echo "Processing complete: $((line_num - 1)) lines processed"
        return 0
    } || {
        echo "Error: Failed to create output file" >&2
        return 1
    }
}
```

Effective file operations are crucial for robust shell scripts. Always handle edge cases and potential errors to create reliable automation tools.
