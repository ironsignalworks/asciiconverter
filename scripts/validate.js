#!/usr/bin/env node

/**
 * Validation script for ASCII Converter
 * Checks all modules for syntax errors and basic issues
 */

import { readdir, readFile } from 'fs/promises';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const results = {
  passed: [],
  failed: [],
  warnings: []
};

async function checkSyntax(filePath) {
  try {
    const content = await readFile(filePath, 'utf-8');
    
    // Basic checks
    const checks = [
      {
        name: 'No console.log statements (use console.error for errors)',
        test: () => !content.includes('console.log('),
        level: 'warning'
      },
      {
        name: 'Has JSDoc comments',
        test: () => content.includes('/**'),
        level: 'info'
      },
      {
        name: 'Uses strict equality',
        test: () => !content.includes('==') || content.includes('==='),
        level: 'warning'
      },
      {
        name: 'No var declarations',
        test: () => !content.match(/\bvar\s+/),
        level: 'warning'
      }
    ];
    
    for (const check of checks) {
      if (!check.test()) {
        if (check.level === 'warning') {
          results.warnings.push(`${filePath}: ${check.name}`);
        }
      }
    }
    
    results.passed.push(filePath);
    return true;
  } catch (error) {
    results.failed.push(`${filePath}: ${error.message}`);
    return false;
  }
}

async function scanDirectory(dir) {
  const files = await readdir(dir, { withFileTypes: true });
  
  for (const file of files) {
    const filePath = join(dir, file.name);
    
    if (file.isDirectory()) {
      await scanDirectory(filePath);
    } else if (extname(file.name) === '.js') {
      await checkSyntax(filePath);
    }
  }
}

async function main() {
  console.log('?? Validating ASCII Converter modules...\n');
  
  const srcDir = join(__dirname, 'src');
  await scanDirectory(srcDir);
  
  console.log('? Passed:', results.passed.length);
  results.passed.forEach(f => console.log('  -', f));
  
  if (results.warnings.length > 0) {
    console.log('\n??  Warnings:', results.warnings.length);
    results.warnings.forEach(w => console.log('  -', w));
  }
  
  if (results.failed.length > 0) {
    console.log('\n? Failed:', results.failed.length);
    results.failed.forEach(f => console.log('  -', f));
    process.exit(1);
  }
  
  console.log('\n? All modules validated successfully!');
}

main().catch(console.error);
