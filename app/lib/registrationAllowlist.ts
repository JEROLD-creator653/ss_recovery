import fs from 'fs';
import path from 'path';

let cachedAllowlist: Set<string> | null = null;

function loadAllowlist(): Set<string> {
  if (cachedAllowlist) return cachedAllowlist;

  const csvPath = path.join(process.cwd(), 'Registration-no-AIML (2).csv');
  const raw = fs.readFileSync(csvPath, 'utf-8');

  const lines = raw.split(/\r?\n/).map((line) => line.trim());
  const values = lines
    .filter((line) => line.length > 0)
    .filter((line) => line.toLowerCase() !== 'registration number');

  cachedAllowlist = new Set(values);
  return cachedAllowlist;
}

export function isAllowedRegistration(rollNumber: string): boolean {
  if (!rollNumber) return false;
  const allowlist = loadAllowlist();
  return allowlist.has(String(rollNumber).trim());
}
