// Template for new project documentation (README++)
export function generateProjectDocTemplate(projectName: string): string {
  return `# ${projectName}

## Problem
Why did I build this? What problem does it solve?

## Solution
My approach and why I chose it.

## Tech Stack
| Technology | Role | Why |
|---|---|---|
| ... | ... | ... |

## Architecture
Describe the system architecture.

## How to Run
Step-by-step setup instructions.

## Key Features
- Feature 1
- Feature 2

## Screenshots / Demo
Add screenshots or demo links here.

## What I Learned
Fill this after completing the project.`
}
