import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const js = readFileSync(new URL('../assets/phase10c-unified-nav.js', import.meta.url), 'utf8');
const main = readFileSync(new URL('../assets/site.js', import.meta.url), 'utf8');
const campaign = readFileSync(new URL('../campaign-commitments.html', import.meta.url), 'utf8');
const transportation = readFileSync(new URL('../transportation-spending.html', import.meta.url), 'utf8');
test('sitewide unified navigation has one Accountability dropdown with both registers', () => {
  assert.ok(js.includes('>Accountability</button>'));
  assert.equal(js.split('href="campaign-commitments.html"').length - 1, 1);
  assert.equal(js.split('href="transportation-spending.html"').length - 1, 1);
  assert.ok(js.includes('data-nav-order="11" class="phase10c-group"'));
  assert.ok(js.includes('[data-nav-order="11"]{order:11!important}'));
  assert.ok(js.includes('.phase10c-group.open .phase10c-submenu{display:block}'));
  assert.ok(js.includes('aria-expanded'));
});
test('page content and shared loader stay in place', () => {
  assert.ok(main.includes('phase10c-unified-nav.js'));
  assert.ok(campaign.includes('Campaign Commitment Register'));
  assert.ok(transportation.includes('Transportation Spending Accountability Register'));
  assert.ok(transportation.includes('assets/site.js'));
});
