---
title: Streams & Processes
description: How pipelines, redirections, and exec shape dataflow and process lifecycles.
---

Understanding how Bash handles streams and processes is crucial for effective shell scripting. This knowledge helps you write efficient scripts, debug problems, and understand the underlying mechanics of command execution.

## The Process Model

Every command in Bash runs as a process with its own memory space, file descriptors, and execution context. Understanding how processes are created, managed, and communicate is fundamental to shell programming.

### Process Creation

When Bash executes a command, it typically follows this pattern:

1. **Fork**: Creates a copy of the current process
2. **Exec**: Replaces the copied process with the new command
3. **Wait**: Parent process waits for child to complete (unless backgrounded)

```bash
# Simple command execution
ls                    # Fork -> exec ls -> wait for completion

# Background execution
ls &                  # Fork -> exec ls -> don't wait (continue immediately)

# Pipeline
ls | grep txt         # Fork for ls, fork for grep, connect via pipe
```

### The exec Builtin: Process Replacement

The `exec` builtin replaces the current shell process entirely, avoiding the fork step:

```bash
# Normal execution: fork -> exec -> wait
/bin/date

# Process replacement: exec only (no fork, no return)
exec /bin/date        # This script ends here, replaced by date

# Practical use: script optimization
if [[ "$optimize" == "true" ]]; then
    exec "$final_command" "$@"  # Replace script with final command
fi
```

**When to use exec:**
- Final command in a script (saves memory)
- Wrapper scripts that just setup environment
- Login shells executing user's preferred shell

## Stream Fundamentals

Every process has three standard streams by default:

- **stdin (0)**: Standard input - where the process reads data
- **stdout (1)**: Standard output - where normal output goes  
- **stderr (2)**: Standard error - where error messages go

### Stream Inheritance

Child processes inherit their parent's file descriptors:

```bash
# Parent process has stdin/stdout/stderr connected to terminal
echo "This goes to terminal"

# Child process inherits the same connections
bash -c 'echo "Child also goes to terminal"'

# Unless redirected
bash -c 'echo "This goes to file"' > output.txt
```

## Pipelines: Stream Connection

Pipelines connect the stdout of one command to the stdin of another, creating data processing chains.

### Basic Pipeline Mechanics

```bash
# Simple pipeline
command1 | command2

# What actually happens:
# 1. Create pipe (kernel buffer)
# 2. Fork command1, redirect stdout to pipe write end
# 3. Fork command2, redirect stdin to pipe read end  
# 4. Both commands run simultaneously
# 5. Data flows through pipe buffer
```

### Pipeline Process Model

```bash
# Each command in pipeline runs in its own process
ps aux | grep bash | wc -l

# Equivalent to:
# Process 1: ps aux (writes to pipe)
# Process 2: grep bash (reads from pipe, writes to new pipe) 
# Process 3: wc -l (reads from pipe, writes to stdout)
```

### Pipeline Exit Status

By default, a pipeline's exit status is the exit status of the last command:

```bash
# Pipeline succeeds if last command succeeds
false | true          # Exit status: 0 (success)

# Set pipefail to catch failures anywhere in pipeline
set -o pipefail
false | true          # Exit status: 1 (failure)

# Practical error handling
set -o pipefail
if ! complex_command | filter | processor; then
    echo "Pipeline failed somewhere" >&2
    exit 1
fi
```

### Pipeline Buffering

Pipes have limited buffer space, causing interesting behaviors:

```bash
# Small data: no blocking
echo "small" | cat

# Large data: may block if reader is slow
yes | head -1000000     # 'yes' blocks when pipe buffer fills

# Practical implications for script design
large_data_generator | slow_processor &
# Generator may block waiting for processor to catch up
```

## Redirection: Stream Control

Redirection allows precise control over where streams go and come from.

### Output Redirection Mechanics

```bash
# Standard output redirection
command > file        # stdout -> file (overwrite)
command >> file       # stdout -> file (append)

# What happens:
# 1. Open file for writing
# 2. Duplicate file descriptor to stdout (fd 1)
# 3. Execute command
# 4. Command writes to fd 1, which goes to file
```

### Error Stream Separation

```bash
# Separate streams for better control
command > output.txt 2> error.txt

# Practical log management
script.sh > script.out 2> script.err

# Or combine for unified logging
script.sh > script.log 2>&1
```

### File Descriptor Manipulation

Understanding file descriptor numbers enables advanced stream control:

```bash
# Standard descriptors
0 = stdin
1 = stdout  
2 = stderr

# Custom descriptors for complex operations
exec 3> debug.log              # Open custom FD for debug output
echo "Debug: processing..." >&3 # Write to debug log
exec 3>&-                      # Close custom FD

# Save and restore streams
exec 6>&1                      # Save original stdout
exec > script.log              # Redirect all output to log
echo "This goes to log file"
exec 1>&6 6>&-                 # Restore original stdout
echo "This goes to terminal"
```

## Subshells vs Command Groups

Understanding when new processes are created helps optimize script performance.

### Subshells: New Process Context

```bash
# Subshell: runs in new process
(
    cd /tmp
    echo "In subshell, pwd is: $(pwd)"
    exit 1        # Only exits subshell
)
echo "Back in parent, pwd is: $(pwd)"  # Original directory

# Variable isolation in subshells
counter=1
(
    counter=99    # Local to subshell
    echo "In subshell: $counter"        # 99
)
echo "In parent: $counter"              # 1

# Practical use: isolated environment changes
(
    export PATH="/special/bin:$PATH"
    run_special_commands
)
# PATH restored automatically
```

### Command Groups: Same Process Context

```bash
# Command group: runs in current process
{
    cd /tmp
    echo "In group, pwd is: $(pwd)"
    # exit 1 would exit entire script
}
echo "Still in group directory: $(pwd)"  # /tmp

# Variable sharing in groups
counter=1
{
    counter=99    # Affects parent
    echo "In group: $counter"           # 99
}
echo "In parent: $counter"              # 99

# Practical use: grouped redirection
{
    echo "Log entry 1"
    echo "Log entry 2"  
    echo "Log entry 3"
} > logfile.txt
```

### Performance Implications

```bash
# Efficient: avoid unnecessary subshells
result=$(command)              # Subshell created
result=`command`               # Subshell created (deprecated syntax)

# More efficient when possible
read result < <(command)       # Process substitution (still creates process)

# Most efficient: direct execution when appropriate
command > tempfile
result=$(< tempfile)           # No subshell for file reading
rm tempfile
```

## Process Communication Patterns

### Producer-Consumer Pattern

```bash
# Data generator feeding consumer
generate_data() {
    for i in {1..1000}; do
        echo "Item $i"
    done
}

process_data() {
    while read -r item; do
        # Process each item
        echo "Processed: $item" >&2
    done
}

# Pipeline connects producer to consumer
generate_data | process_data
```

### Fan-out Pattern

```bash
# Send data to multiple processors
generate_data | tee >(processor1) >(processor2) | processor3

# Practical example: logging and processing
access_logs | tee >(parse_errors) >(analyze_performance) | generate_report
```

### Error Handling in Pipelines

```bash
# Capture both output and errors from pipeline
{
    complex_pipeline 2>&3 | process_output
} 3>&1 1>&2 | process_errors

# Alternative: separate error handling
if ! output=$(complex_pipeline 2>&1); then
    echo "Pipeline failed: $output" >&2
    exit 1
fi
```

## Best Practices

### 1. Use set -o pipefail

```bash
#!/bin/bash
set -o pipefail  # Fail if any pipeline component fails

# Now pipeline failures are caught
if ! data_source | validator | processor; then
    echo "Data processing pipeline failed" >&2
    exit 1
fi
```

### 2. Handle Stream Blocking

```bash
# Avoid deadlocks in bidirectional communication
mkfifo request_pipe response_pipe

# Wrong: can deadlock
echo "request" > request_pipe
response=$(< response_pipe)

# Right: background one direction
echo "request" > request_pipe &
response=$(< response_pipe)
wait  # Wait for background write to complete
```

### 3. Clean Up Resources

```bash
# Always close custom file descriptors
cleanup() {
    exec 3>&- 4>&- 5>&-  # Close custom FDs
    rm -f "$temp_pipe"   # Remove temporary files
}
trap cleanup EXIT

exec 3> output.log
exec 4< input.data
exec 5<> bidirectional.pipe
# Processing...
```

### 4. Optimize Process Creation

```bash
# Expensive: many subshells
for file in *.txt; do
    count=$(wc -l < "$file")          # Subshell for each file
    echo "$file: $count lines"
done

# Efficient: single command
wc -l *.txt                           # One process, handles all files

# Balance: reasonable batching
find . -name "*.txt" -print0 | 
    xargs -0 -n10 wc -l               # Process 10 files at a time
```

Understanding streams and processes enables you to write more efficient scripts, debug complex problems, and design robust data processing pipelines. The key is knowing when processes are created, how streams are connected, and where data flows in your command chains.

## See Also

- Related concepts: [File Operations](/concepts/file-operations/), [Functions](/concepts/functions/)
- Related syntax: [Redirection](/reference/syntax/redirection/), [Pipelines](/reference/syntax/pipelines/)
- Related builtins: [`exec`](/reference/builtins/exec/), [`trap`](/reference/builtins/trap/)
