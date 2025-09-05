---
title: Redirection
description: Direct file descriptors to/from files and other file descriptors.
---

Redirection in Bash allows you to control where command input comes from and where output goes. It's essential for file processing, logging, and building command pipelines.

## Synopsis

Basic redirection forms:

- `n>file` - Redirect file descriptor `n` to `file` (output)
- `n>>file` - Append file descriptor `n` to `file` 
- `n<file` - Redirect file descriptor `n` from `file` (input)
- `n>&m` - Redirect file descriptor `n` to file descriptor `m`
- `n<&m` - Redirect file descriptor `n` from file descriptor `m`
- `<<EOF` - Here document (multi-line input)
- `<<<word` - Here string (single line input)

**Default file descriptors:**
- `0` - stdin (standard input)
- `1` - stdout (standard output) 
- `2` - stderr (standard error)

## Output Redirection

### Basic Output

```bash
# Redirect stdout to file (overwrites)
echo "Hello" > output.txt
ls > filelist.txt

# Append to file
echo "World" >> output.txt
date >> log.txt

# Redirect stderr to file
command_that_fails 2> error.log
find /proc -name "status" 2> /dev/null

# Redirect both stdout and stderr
command > output.log 2>&1
command &> output.log    # Bash 4+ shorthand
```

### Advanced Output Redirection

```bash
# Separate stdout and stderr
command > output.txt 2> error.txt

# Merge stderr into stdout
command 2>&1 | grep "pattern"

# Discard output
command > /dev/null      # Discard stdout
command 2> /dev/null     # Discard stderr  
command > /dev/null 2>&1 # Discard both

# Tee - write to file AND stdout
command | tee output.txt
command | tee -a log.txt  # Append mode
```

## Input Redirection

### Basic Input

```bash
# Read from file
sort < unsorted.txt
wc -l < data.txt
grep "pattern" < input.txt

# Equivalent forms
cat input.txt | grep "pattern"
grep "pattern" < input.txt
```

### Here Documents (<<)

Multi-line input without external files:

```bash
# Basic here document
cat << EOF
Line 1
Line 2
Line 3
EOF

# Variable expansion in here docs
name="Alice"
cat << EOF
Hello, $name!
Today is $(date)
EOF

# Suppress variable expansion with quoted delimiter
cat << 'EOF'
Literal $name and $(date)
EOF

# Indented here document (remove leading tabs)
cat <<- EOF
	This line has a leading tab
	So does this one
EOF
```

### Here Strings (<<<)

Single line input from string:

```bash
# Basic here string
grep "pattern" <<< "search in this text"
sort <<< "cherry apple banana"

# With variables
text="Hello World"
wc -w <<< "$text"

# Multiple lines (newlines preserved)
cat <<< "Line 1
Line 2
Line 3"
```

## File Descriptor Manipulation

### Custom File Descriptors

```bash
# Open file descriptor for writing
exec 3> output.txt
echo "Line 1" >&3
echo "Line 2" >&3
exec 3>&-  # Close file descriptor 3

# Open file descriptor for reading
exec 4< input.txt
read line1 <&4
read line2 <&4
exec 4<&-  # Close file descriptor 4

# Bidirectional file descriptor
exec 5<> data.txt  # Open for read and write
```

### Swapping File Descriptors

```bash
# Swap stdout and stderr
command 3>&1 1>&2 2>&3 3>&-

# Save and restore stdout
exec 6>&1        # Save stdout
exec > log.txt   # Redirect stdout to log
echo "This goes to log"
exec 1>&6 6>&-   # Restore stdout
echo "This goes to terminal"
```

## Process Substitution

Treat command output as files:

```bash
# Compare output of two commands
diff <(sort file1.txt) <(sort file2.txt)

# Use command output as input
while read -r line; do
    echo "Processing: $line"
done < <(find . -name "*.txt")

# Write to command input
echo "data" > >(gzip > compressed.gz)

# Multiple inputs
paste <(seq 1 5) <(seq 6 10)
```

## Practical Examples

### Logging

```bash
# Log both output and errors
script.sh > script.log 2>&1

# Log errors separately
script.sh > output.txt 2> error.log

# Log with timestamps
exec > >(while read line; do echo "$(date): $line"; done | tee -a timestamped.log)
```

### Error Handling

```bash
# Capture both output and errors
{
    output=$(command 2>&1)
    status=$?
} 

if [[ $status -ne 0 ]]; then
    echo "Command failed: $output" >&2
fi

# Silent command with error capture
if ! output=$(command 2>&1); then
    echo "Error: $output" >&2
    exit 1
fi
```

### File Processing

```bash
# Process file line by line
while IFS= read -r line; do
    echo "Processing: $line"
done < input.txt

# Create temporary input
grep "pattern" files*.txt > temp_matches.txt
sort temp_matches.txt > sorted_matches.txt

# Pipeline with intermediate files
command1 > temp1.txt
command2 < temp1.txt > temp2.txt
command3 < temp2.txt > final.txt
```

### Configuration and Setup

```bash
# Create config file
cat > app.conf << EOF
debug=true
port=8080
database_url=postgresql://localhost/mydb
EOF

# Multi-line string to variable
config=$(cat << 'EOF'
user=admin
password=secret
host=localhost
EOF
)

# Append to existing config
cat >> ~/.bashrc << 'EOF'
# Custom aliases
alias ll='ls -la'
alias grep='grep --color=auto'
EOF
```

## Advanced Patterns

### Conditional Redirection

```bash
# Redirect based on condition
if [[ "$debug" == "true" ]]; then
    command > debug.log 2>&1
else
    command > /dev/null 2>&1
fi

# Dynamic redirection
log_file="${LOG_FILE:-/dev/null}"
command > "$log_file" 2>&1
```

### Multiple Outputs

```bash
# Write to multiple files
command | tee file1.txt file2.txt file3.txt

# Separate processing of stdout/stderr
{
    command 2>&3 | process_output
} 3>&1 1>&2 | process_errors

# Fan-out pattern
command | tee >(process1) >(process2) > final_output.txt
```

### Complex Pipelines

```bash
# Pipeline with error handling
{
    command1 |
    command2 |
    command3
} 2> pipeline_errors.log > pipeline_output.txt

# Bidirectional pipe (named pipe/FIFO)
mkfifo pipe
command1 > pipe &
command2 < pipe
rm pipe
```

## Common Pitfalls and Solutions

### Order of Redirection

```bash
# Wrong: stderr goes to old stdout (terminal)
command > file.txt 2>&1

# Wrong: 2>&1 happens before > file.txt
command 2>&1 > file.txt

# Right: stderr follows stdout to file
command > file.txt 2>&1
```

### Variable Expansion in Here Documents

```bash
# Variables expand by default
name="Alice"
cat << EOF
Hello, $name
EOF

# Prevent expansion with quoted delimiter
cat << 'EOF'
Hello, $name  # Literal $name
EOF

# Mixed expansion
cat << EOF
Hello, $name
Literal: \$HOME
EOF
```

### File Descriptor Leaks

```bash
# Bad: file descriptor left open
exec 3> file.txt
echo "data" >&3
# File descriptor 3 still open!

# Good: always close when done
exec 3> file.txt
echo "data" >&3
exec 3>&-  # Close file descriptor
```

## Performance Considerations

```bash
# Efficient: single redirection
{
    echo "line 1"
    echo "line 2" 
    echo "line 3"
} > output.txt

# Inefficient: multiple redirections
echo "line 1" > output.txt
echo "line 2" >> output.txt
echo "line 3" >> output.txt

# Efficient: here document for multi-line
cat > config.txt << EOF
setting1=value1
setting2=value2
EOF

# Less efficient: multiple echo commands
echo "setting1=value1" > config.txt
echo "setting2=value2" >> config.txt
```

## See Also

- Related concepts: [File Operations](/concepts/file-operations/), [Variables](/concepts/variables/)
- Related syntax: [Quoting](/reference/syntax/quoting/), [Pipelines](/reference/syntax/pipelines/)
- Related builtins: [`read`](/reference/builtins/read/), [`echo`](/reference/builtins/echo/)
