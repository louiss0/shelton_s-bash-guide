---
title: Run Script in Subproject
description: How to execute scripts or commands within a subdirectory or subproject from your current location.
---

This guide explains how to run scripts or commands in a subproject directory without changing your current working directory.

## Method 1: Using Subshells

Execute commands in a subdirectory using a subshell with parentheses:

```bash
(cd subproject && npm install && npm run build)
```

This approach:
- Changes to the `subproject` directory
- Runs the commands inside the subshell
- Returns to your original directory when complete

## Method 2: Using the -C Flag

Many commands support the `-C` flag to change directory before execution:

```bash
# Using make in a subdirectory
make -C subproject build

# Using git in a subdirectory
git -C subproject status
```

## Method 3: Specifying Paths Directly

Some package managers and build tools accept path arguments:

```bash
# Using npm with a specific directory
npm --prefix ./subproject install
npm --prefix ./subproject run build

# Using pnpm with a specific directory
pnpm --dir ./subproject install
pnpm --dir ./subproject run build
```

## Method 4: Using Functions

Create a reusable function for common operations:

```bash
run_in_subproject() {
    local dir="$1"
    shift
    (cd "$dir" && "$@")
}

# Usage
run_in_subproject ./frontend npm run dev
run_in_subproject ./backend cargo run
```

## Best Practices

1. **Use subshells** when you need to run multiple commands in sequence
2. **Check directory exists** before attempting to run commands:
   ```bash
   if [[ -d "subproject" ]]; then
       (cd subproject && npm run build)
   else
       echo "Error: subproject directory not found"
       exit 1
   fi
   ```
3. **Handle errors properly** by checking exit codes:
   ```bash
   if ! (cd subproject && npm run build); then
       echo "Build failed in subproject"
       exit 1
   fi
   ```

## Real-world Example

Here's a complete example of building multiple subprojects:

```bash
#!/bin/bash

projects=("frontend" "backend" "shared")

for project in "${projects[@]}"; do
    echo "Building $project..."
    if [[ -d "$project" ]]; then
        if (cd "$project" && npm install && npm run build); then
            echo "✅ $project built successfully"
        else
            echo "❌ Failed to build $project"
            exit 1
        fi
    else
        echo "⚠️  Directory $project not found, skipping..."
    fi
done

echo "All projects built successfully!"
```

This approach ensures each subproject is built in isolation while maintaining your original working directory.
