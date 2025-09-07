---
title: Loops
description: for, while, until, and select loops for repetitive tasks and menus.
---

Loops in Bash allow you to repeat commands and process collections of data efficiently. Bash provides several loop constructs for different use cases.

## for Loops

The `for` loop is most commonly used to iterate over lists of items.

### List Iteration

```bash
# Loop over literal values
for fruit in apple banana cherry; do
    echo "Processing: $fruit"
done

# Loop over files
for file in *.txt; do
    if [[ -f "$file" ]]; then
        echo "Found text file: $file"
        wc -l "$file"
    fi
done

# Loop over command output
for user in $(cut -d: -f1 /etc/passwd); do
    echo "User: $user"
done

# Better: loop over array (handles spaces correctly)
users=($(cut -d: -f1 /etc/passwd))
for user in "${users[@]}"; do
    echo "User: $user"
done
```

### C-style for Loops

```bash
# Numeric iteration
for ((i = 1; i <= 10; i++)); do
    echo "Number: $i"
done

# Countdown
for ((i = 10; i > 0; i--)); do
    echo "Countdown: $i"
    sleep 1
done
echo "Liftoff!"

# Custom increment
for ((i = 0; i <= 100; i += 10)); do
    echo "Progress: $i%"
done
```

### Processing Arguments

```bash
process_files() {
    # Process all arguments
    for file in "$@"; do
        if [[ -r "$file" ]]; then
            echo "Processing: $file"
            # Process file here
        else
            echo "Cannot read: $file" >&2
        fi
    done
}

# Call function with multiple files
process_files *.log /path/to/config.txt
```

## while Loops

The `while` loop continues as long as the condition is true (exit status 0).

### Basic while Loop

```bash
# Simple counter
count=1
while [[ $count -le 5 ]]; do
    echo "Count: $count"
    ((count++))
done

# Wait for condition
while [[ ! -f "ready.flag" ]]; do
    echo "Waiting for ready flag..."
    sleep 1
done
echo "Ready flag found!"
```

### Reading Files Line by Line

```bash
# Read file line by line (best practice)
while IFS= read -r line; do
    echo "Line: $line"
done < "input.txt"

# Read with line numbers
line_num=1
while IFS= read -r line; do
    printf "%3d: %s\n" "$line_num" "$line"
    ((line_num++))
done < "input.txt"

# Process CSV files
while IFS=',' read -r name email department; do
    echo "Employee: $name ($email) - $department"
done < "employees.csv"
```

### Interactive Loops

```bash
# User input loop
while true; do
    read -p "Enter command (quit to exit): " cmd
    
    case "$cmd" in
        quit|exit)
            break
            ;;
        help)
            echo "Available commands: help, status, quit"
            ;;
        status)
            echo "System status: OK"
            ;;
        *)
            echo "Unknown command: $cmd"
            ;;
    esac
done
```

### Process Monitoring

```bash
# Monitor process
while kill -0 "$PID" 2>/dev/null; do
    echo "Process $PID is still running..."
    sleep 5
done
echo "Process $PID has finished"

# Wait for network service
while ! nc -z localhost 8080; do
    echo "Waiting for service on port 8080..."
    sleep 2
done
echo "Service is ready!"
```

## until Loops

The `until` loop continues as long as the condition is false (non-zero exit status).

```bash
# Wait until condition becomes true
until [[ -f "process.done" ]]; do
    echo "Waiting for process to complete..."
    sleep 3
done

# Countdown with until
countdown=10
until [[ $countdown -eq 0 ]]; do
    echo "Time remaining: $countdown seconds"
    ((countdown--))
    sleep 1
done
echo "Time's up!"

# Network connectivity check
until ping -c 1 google.com &>/dev/null; do
    echo "No internet connection, retrying..."
    sleep 5
done
echo "Internet connection restored!"
```

## select Loops (Menus)

The `select` loop creates interactive menus.

### Basic Menu

```bash
# Simple menu
echo "Choose an option:"
select option in "List files" "Show date" "Exit"; do
    case "$option" in
        "List files")
            ls -la
            ;;
        "Show date")
            date
            ;;
        "Exit")
            echo "Goodbye!"
            break
            ;;
        *)
            echo "Invalid selection"
            ;;
    esac
done
```

### Advanced Menu

```bash
# Menu with validation and custom prompt
backup_menu() {
    local PS3="Select backup type: "
    local -a options=("Full backup" "Incremental backup" "Restore" "Quit")
    
    select choice in "${options[@]}"; do
        case "$REPLY" in
            1)
                echo "Starting full backup..."
                perform_full_backup
                ;;
            2)
                echo "Starting incremental backup..."
                perform_incremental_backup
                ;;
            3)
                echo "Starting restore..."
                perform_restore
                ;;
            4)
                echo "Exiting backup menu"
                break
                ;;
            *)
                echo "Invalid selection. Please choose 1-4."
                ;;
        esac
    done
}
```

## Loop Control

### break and continue

```bash
# Skip certain iterations
for i in {1..10}; do
    if [[ $i -eq 5 ]]; then
        continue  # Skip iteration when i=5
    fi
    
    if [[ $i -eq 8 ]]; then
        break     # Exit loop when i=8
    fi
    
    echo "Number: $i"
done
# Output: 1, 2, 3, 4, 6, 7

# Nested loop control
for outer in {1..3}; do
    echo "Outer loop: $outer"
    for inner in {1..3}; do
        if [[ $inner -eq 2 ]]; then
            continue  # Only affects inner loop
        fi
        echo "  Inner loop: $inner"
    done
done
```

### Loop Labels (Advanced)

```bash
# Breaking out of nested loops
outer_loop: for i in {1..3}; do
    echo "Outer: $i"
    for j in {1..3}; do
        if [[ $i -eq 2 && $j -eq 2 ]]; then
            break 2  # Break out of both loops
            # Or use: break outer_loop (in some shells)
        fi
        echo "  Inner: $j"
    done
done
```

## Advanced Loop Patterns

### Parallel Processing

```bash
# Process files in parallel (background jobs)
for file in *.log; do
    {
        echo "Processing $file in background"
        # Long-running process here
        gzip "$file"
    } &
done

# Wait for all background jobs to complete
wait
echo "All files processed"
```

### Error Handling in Loops

```bash
# Continue on errors
for file in *.txt; do
    if ! process_file "$file"; then
        echo "Failed to process $file, continuing..." >&2
        continue
    fi
    echo "Successfully processed $file"
done

# Stop on first error
set -e  # Exit on any error
for file in *.txt; do
    process_file "$file"
    echo "Processed $file"
done
```

### Loop with Progress Indication

```bash
# Progress counter
files=(*.jpg)
total=${#files[@]}
count=0

for file in "${files[@]}"; do
    ((count++))
    echo "Processing $count/$total: $file"
    # Process file here
    convert "$file" "thumb_$file"
done
echo "Completed processing $total files"
```

## Common Patterns

### Processing Log Files

```bash
# Analyze log file patterns
analyze_logs() {
    local log_file="$1"
    local -A ip_counts=()
    
    # Count IP addresses
    while read -r line; do
        if [[ "$line" =~ ([0-9]{1,3}\.){3}[0-9]{1,3} ]]; then
            ip="${BASH_REMATCH[0]}"
            ((ip_counts["$ip"]++))
        fi
    done < "$log_file"
    
    # Display results
    echo "Top IP addresses:"
    for ip in "${!ip_counts[@]}"; do
        printf "%s: %d requests\n" "$ip" "${ip_counts[$ip]}"
    done | sort -rn -k2
}
```

### Batch File Operations

```bash
# Rename files with pattern
rename_photos() {
    local prefix="vacation_"
    local counter=1
    
    for file in IMG_*.jpg; do
        if [[ -f "$file" ]]; then
            new_name="${prefix}$(printf "%03d" $counter).jpg"
            mv "$file" "$new_name"
            echo "Renamed: $file -> $new_name"
            ((counter++))
        fi
    done
}
```

### Configuration Processing

```bash
# Process configuration files
load_config() {
    local config_file="$1"
    
    while IFS='=' read -r key value; do
        # Skip empty lines and comments
        [[ "$key" =~ ^[[:space:]]*$ ]] && continue
        [[ "$key" =~ ^[[:space:]]*# ]] && continue
        
        # Remove leading/trailing whitespace
        key="${key//[[:space:]]/}"
        value="${value#"${value%%[![:space:]]*}"}"
        value="${value%"${value##*[![:space:]]}"}"
        
        # Export as environment variable
        declare -g "$key"="$value"
        echo "Set $key=$value"
        
    done < "$config_file"
}
```

## Best Practices

1. **Use appropriate loop type** - `for` for known lists, `while` for conditions
2. **Handle empty globs** - Check if files exist before processing
3. **Quote variables** - Prevent word splitting issues
4. **Use arrays for complex data** - Better than space-separated strings
5. **Add progress indicators** - For long-running loops
6. **Handle interruption** - Trap signals in long loops

```bash
# Robust file processing example
process_files_safely() {
    local -a files=("$@")
    
    # Check if any files provided
    if [[ ${#files[@]} -eq 0 ]]; then
        echo "No files provided" >&2
        return 1
    fi
    
    # Process each file with error handling
    local count=0
    local total=${#files[@]}
    
    for file in "${files[@]}"; do
        ((count++))
        echo "Processing $count/$total: $file"
        
        if [[ ! -r "$file" ]]; then
            echo "Warning: Cannot read $file, skipping" >&2
            continue
        fi
        
        if ! process_single_file "$file"; then
            echo "Error processing $file" >&2
            # Decide whether to continue or exit
            continue
        fi
        
        echo "Successfully processed $file"
    done
}
```

Loops are essential for automating repetitive tasks and processing collections of data efficiently in Bash scripts.
