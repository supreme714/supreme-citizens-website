import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = readFileSync(new URL('../transportation-spending.html', import.meta.url), 'utf8');
const sitemap = readFileSync(new URL('../sitemap.xml', import.meta.url), 'utf8');
const register = readFileSync(new URL('../campaign-commitments.html', import.meta.url), 'utf8');

test('register is linked from existing site and sitemap', () => {
  assert.match(register, /href="transportation-spending\.html"/);
  assert.match(sitemap, /https:\/\/supremecitizens\.org\/transportation-spending\.html/);
  assert.match(page, /<main id="main">/);
  assert.match(page, /<h1>Transportation Spending Accountability Register<\/h1>/);
  assert.match(page, /aria-label="Primary"/);
});
test('baseline totals match CRS R48947 Table 1, and proposal is identified', () => {
  for (const n of ['144.639','153.052','148.520','113.917']) {
    assert.ok(page.includes(n), 'Missing DOT baseline total: ' + n);
  }
  assert.match(page, /2025<\/td><td>Transition/);
  assert.match(page, /2027<\/td><td>Trump<\/td><td>\$113\.917<\/td><td>Proposed; not enacted/);
  assert.match(page, /FY2027 figures below are presidential proposals, not enacted appropriations/);
  assert.match(page, /P\.L\. 119-103/);
  assert.match(page, /December 11, 2026/);
});
test('comparison data has four fiscal-year columns and CRS values', () => {
  const expected = [
    '[25.081,26.017,27.206,22.357]',
    '[72.480,79.900,75.213,66.162]',
    '[20.855,20.937,20.915,16.315]',
    '[16.170,16.125,14.872,2.797]',
    '[1.559,1.582,1.452,1.293]',
    '[1.062,1.044,1.066,.946]',
    '[1.433,1.350,1.932,2.566]'
  ];
  for (const item of expected) assert.ok(page.includes(item), 'Incorrect/missing CRS row ' + item);
});
test('all seven tracks, official citations, and missing-value caveats exist', () => {
  for (const title of [
    'Presidential budget requests',
    'Congressional appropriations',
    'Agency obligations and expenditures',
    'Program reductions',
    'Air traffic modernization',
    'Completion and safety outcomes',
    'Quarterly verification'
  ]) assert.ok(page.includes(title), 'Missing track ' + title);
  for (const site of ['www.everycrsreport.com','files.gao.gov','www.nhtsa.gov','www.usaspending.gov']) {
    assert.ok(page.includes(site), 'Missing source: ' + site);
  }
  assert.match(page, /not the same as Treasury outlays/);
  assert.match(page, /FY2026 outlays: awaiting reconciled source/);
  assert.match(page, /not itself an automated monitoring service/);
});

test('page uses shared site assets and footer', () => {
  assert.match(page, /src="assets\/site\.js"/);
  assert.doesNotMatch(page, /assets\/main\.js/);
  assert.match(page, /class="site-footer"/);
  assert.match(page, /<label for="ts-year">Fiscal year<\/label>/);
});
