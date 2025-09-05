---
title: echo
description: Print arguments to standard output with optional formatting.
---

The `echo` builtin prints its arguments to standard output, separated by spaces and followed by a newline. It's one of the most commonly used commands for displaying text and variables.

## Synopsis

```
echo [-neE] [arg …]
```

## Parameters

- `-n`: Do not output trailing newline
- `-e`: Enable interpretation of backslash escapes
- `-E`: Disable interpretation of backslash escapes (default in Bash)

## Return Codes

- `0`: Success
- `1`: Write error occurred

## Minimal Examples

```bash
# Basic output
echo "Hello, World!"

# Without trailing newline
echo -n "Prompt: "

# With escape sequences
echo -e "Line 1\nLine 2\tTabbed"

# Variable expansion
name="Alice"
echo "Hello, $name!"

# Multiple arguments
echo "The" "quick" "brown" "fox"
```

## Escape Sequences (with -e)

When `-e` is enabled, these escape sequences are interpreted:

```bash
echo -e "\a"      # Alert (bell)
echo -e "\b"      # Backspace
echo -e "\c"      # Suppress trailing newline
echo -e "\e"      # Escape character
echo -e "\f"      # Form feed
echo -e "\n"      # Newline
echo -e "\r"      # Carriage return
echo -e "\t"      # Horizontal tab
echo -e "\v"      # Vertical tab
echo -e "\\"      # Literal backslash
echo -e "\nnn"    # Character with octal value nnn
echo -e "\xhh"    # Character with hex value hh
```

## Common Patterns

```bash
# Creating simple prompts
echo -n "Enter your name: "
read name

# Formatting output
echo -e "Name:\t$name"
echo -e "Status:\tActive"

# Creating separators
echo "==================="
echo "  Processing Files"
echo "==================="

# Conditional output
[[ "$debug" == "true" ]] && echo "Debug mode enabled"

# Multiple lines
echo -e "Configuration:\n\tHost: $host\n\tPort: $port"
```

## Notes

- **Portability**: The behavior of `echo` varies between systems. For portable scripts, prefer `printf`
- **Performance**: `echo` is a builtin in Bash, making it faster than external commands
- **Quoting**: Always quote arguments containing spaces or special characters
- **Variables**: Use double quotes to allow variable expansion: `echo "$var"`
- **Literal strings**: Use single quotes to prevent expansion: `echo '$var'`

## Comparison with printf

```bash
# echo (less portable, simpler syntax)
echo "Name: $name"
echo -n "No newline"
echo -e "Tab:\tSeparated"

# printf (more portable, more control)
printf "Name: %s\n" "$name"
printf "No newline"
printf "Tab:\tSeparated\n"
```

## See Also

- Related builtins: [`printf`](/reference/builtins/printf/), [`read`](/reference/builtins/read/)
- Related concepts: [Variables](/concepts/variables/), [File Operations](/concepts/file-operations/)
