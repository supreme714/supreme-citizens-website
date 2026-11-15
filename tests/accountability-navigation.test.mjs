import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const js = readFileSync(new URL('../assets/phase10c-unified-nav.js', import.meta.url), 'utf8');
const main = readFileSync(new URL('../assets/site.js', import.meta.url), 'utf8');
const campaign = readFileSync(new URL('../campaign-commitments.html', import.meta.url), 'utf8');
const transportation = readFileSync(new URL('../transportation-spending.html', import.meta.url), 'utf8');
test('sitewide unified navigation includes one Accountability dropdown with both registers', () => {
  assert.match(js, /<button type=\\"button\\" aria-expanded=\\"false\\">Accountability<\/button>/);
  assert.equal((js.match(/href=\\"campaign-commitments\.html\\"/g) || []).length, 1);
  assert.equal((js.match(/href=\\"transportation-spending\.html\\"/g) || []).length, 1);
  assert.match(js, /data-nav-order=\\"11\\" class=\\"phase10c-group\\"/);
  assert.match(js, /data-nav-order="11"\]\{order:11!important\}/);
  assert.match(js, /\.phase10c-group\.open \.phase10c-submenu\{display:block\}/);
  assert.match(js, /aria-expanded/);
});
test('page content and shared loader stay in place', () => {
  assert.match(main, /phase10c-unified-nav\.js/);
  assert.match(campaign, /Campaign Commitment Register/);
  assert.match(transportation, /Transportation Spending Accountability Register/);
  assert.match(transportation, /assets\/site\.js/);
});
