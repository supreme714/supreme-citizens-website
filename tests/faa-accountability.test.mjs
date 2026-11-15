import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const page=readFileSync(new URL('../faa-accountability.html',import.meta.url),'utf8');
const register=readFileSync(new URL('../transportation-spending.html',import.meta.url),'utf8');
const sitemap=readFileSync(new URL('../sitemap.xml',import.meta.url),'utf8');
test('FAA review appears in transportation register and sitemap',()=>{
 assert.ok(register.includes('href="faa-accountability.html"'));
 assert.ok(sitemap.includes('https://supremecitizens.org/faa-accountability.html'));
});
test('FAA review has sourced proposals and oversight limitations',()=>{
 for(const x of ['Project 2025','119G','119J','11,389','$12.5B','November 13, 2026','not a real-time','FAA-008']) assert.ok(page.includes(x),'Missing '+x);
 assert.ok(page.includes('2024, §207'));
 assert.ok(page.includes('rel="noopener noreferrer"'));
});
test('FAA review reuses site navigation and has accessible filters',()=>{
 for(const x of ['assets/site.js','site-header','site-footer','id="faa-search"','id="faa-status"','aria-live="polite"']) assert.ok(page.includes(x),'Missing '+x);
});
