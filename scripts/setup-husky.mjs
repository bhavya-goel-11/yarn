import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const gitDir = join(process.cwd(), '.git');

if (!existsSync(gitDir)) {
  console.warn('Skipping Husky setup because .git directory is missing.');
  process.exit(0);
}

try {
  execSync('npx husky init', { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to initialize Husky:', error);
  process.exit(1);
}
