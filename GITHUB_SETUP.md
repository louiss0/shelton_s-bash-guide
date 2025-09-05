# GitHub Repository Setup Instructions

## Required GitHub Settings

After pushing this repository to GitHub, configure the following settings:

### 1. GitHub Pages Configuration
- Go to **Settings** → **Pages**
- **Source**: Deploy from a branch
- **Branch**: Select "GitHub Actions" (not a branch)
- This enables the deploy workflow to publish to GitHub Pages

### 2. Update Site URL
Once you know your GitHub repository URL, update `astro.config.mjs`:
```javascript
site: 'https://yourusername.github.io/repository-name'
```

### 3. Branch Protection (Recommended)
- Go to **Settings** → **Branches**
- Add protection rules for `main` and `develop`:
  - Require status checks before merging
  - Require branches to be up to date before merging
  - Include "Documentation Quality Check" in required status checks

### 4. Workflow Permissions
The workflows are configured with appropriate permissions:
- `quality-check.yml`: Read-only access
- `deploy.yml`: Pages write and ID token permissions
- `preview.yml`: Read-only access

## CI/CD Flow

1. **Feature Development**: Work on feature branches
2. **PR to Develop**: Quality checks run automatically
3. **Merge to Develop**: Quality checks run again
4. **PR to Main**: Final quality validation
5. **Merge to Main**: Automatic deployment to GitHub Pages

All workflows include spell checking with cspell!
