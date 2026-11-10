#!/usr/bin/env node
// Validation checks syntax, provenance fields, dates and internal consistency.
// Passing these checks does NOT establish the truth of campaign claims.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_FILE = resolve(root, 'data/mandate-commitments.json');
const allowedStatuses = new Set(['Documented commitment', 'Related action identified', 'Outcome documented']);
const requiredText = ['id', 'official', 'office', 'election_cycle', 'topic', 'commitment', 'status', 'context', 'source_url', 'reviewed_on', 'commitment_date'];
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export function validISODate(value) {
  if (typeof value !== 'string' || !dateRegex.test(value)) return false;
  const date = new Date(value + 'T00:00:00Z');
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

export function safeURL(value, official = false) {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return false;
    const host = url.hostname.toLowerCase();
    if (!host.includes('.') || host === 'localhost' || host.endsWith('.localhost') || /^\d+\.\d+\.\d+\.\d+$/.test(host)) return false;
    if (official && !(host.endsWith('.gov') || host.endsWith('.mil'))) return false;
    return true;
  } catch { return false; }
}

export function validateRegister(data) {
  const problems = [];
  if (!data || typeof data !== 'object' || Array.isArray(data)) return ['Root must be an object'];
  if (data.schema_version !== 2) problems.push('schema_version must be 2');
  if (!validISODate(data.last_reviewed)) problems.push('last_reviewed must be YYYY-MM-DD');
  if (!Array.isArray(data.entries)) return [...problems, 'entries must be an array'];
  const ids = new Set(), duplicates = new Set();
  for (const [index, entry] of data.entries.entries()) {
    const where = 'entries[' + index + ']';
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) { problems.push(where + ': expected object'); continue; }
    for (const field of requiredText) if (typeof entry[field] !== 'string' || !entry[field].trim()) problems.push(where + ': missing ' + field);
    if (typeof entry.id === 'string') {
      if (!/^[a-z0-9][a-z0-9-]{2,100}$/.test(entry.id)) problems.push(where + ': invalid id');
      if (ids.has(entry.id)) problems.push(where + ': duplicate id ' + entry.id);
      ids.add(entry.id);
    }
    if (!allowedStatuses.has(entry.status)) problems.push(where + ': unsupported status');
    if (!validISODate(entry.commitment_date)) problems.push(where + ': invalid commitment_date');
    if (!validISODate(entry.reviewed_on)) problems.push(where + ': invalid reviewed_on');
    if (!safeURL(entry.source_url)) problems.push(where + ': source_url must be an HTTPS public web address');
    if (!Number.isInteger(entry.election_year) || entry.election_year < 1788 || entry.election_year > 2200) problems.push(where + ': invalid election_year');
    if (validISODate(entry.commitment_date) && Number.isInteger(entry.election_year) && Math.abs(+entry.commitment_date.slice(0,4)-entry.election_year)>2) problems.push(where + ': campaign statement and election year differ by over two years; review source dating');
    if (entry.action_url || entry.action_date) {
      if (!safeURL(entry.action_url, true)) problems.push(where + ': action_url must be an authoritative HTTPS .gov or .mil link');
      if (!validISODate(entry.action_date)) problems.push(where + ': action_date required for identified government action');
      if (typeof entry.action_date_description !== 'string' || !entry.action_date_description.trim()) problems.push(where + ': action_date_description required');
    }
    if (entry.status !== 'Documented commitment' && !(entry.action_url && entry.action_date)) problems.push(where + ': action-related status requires source and date');
    const key = [entry.official, entry.commitment_date, entry.commitment].map(x => String(x||'').toLowerCase().trim().replace(/\s+/g,' ')).join('|');
    if (duplicates.has(key)) problems.push(where + ': duplicate official/date/commitment tuple');
    duplicates.add(key);
  }
  return problems;
}

export function main(file=DEFAULT_FILE) {
  try {
    const data=JSON.parse(readFileSync(file,'utf8'));
    const issues=validateRegister(data);
    if(issues.length){for(const issue of issues) console.error('INVALID: '+issue); return 1;}
    console.log('PASS: '+data.entries.length+' register records meet structural and source-field requirements.');
    console.log('NOTE: Manual or independently authenticated source-content review remains required before publication.');
    return 0;
  } catch(error) {console.error('INVALID: cannot read/parse register: '+error.message);return 1;}
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url))process.exitCode=main(process.argv[2] ? resolve(process.argv[2]) : DEFAULT_FILE);
