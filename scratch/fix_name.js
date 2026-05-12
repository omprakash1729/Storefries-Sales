import { readFileSync, writeFileSync } from 'fs';
const file = 'src/lib/seed-data.ts';
const data = readFileSync(file, 'utf-8');
const updated = data.replace(/"Omprakash"/g, '"Om Prakash"');
writeFileSync(file, updated, 'utf-8');
console.log("Done.");
