#!/usr/bin/env node
'use strict';

const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const args = process.argv.slice(2);

function usage() {
  console.log(`Usage: gzip-cli [options] [file...]

Compress or decompress files using gzip.

Options:
  -d, --decompress   Decompress (gunzip) mode
  -c, --stdout       Write to stdout instead of file
  -k, --keep         Keep original file (don't delete)
  -l, --level <n>    Compression level 1-9 (default: 6)
  -f, --force        Overwrite existing output files
  -h, --help         Show this help
  -v, --version      Show version

Examples:
  gzip-cli file.txt              Compress file.txt → file.txt.gz
  gzip-cli -d file.txt.gz        Decompress file.txt.gz → file.txt
  cat file | gzip-cli -c         Compress stdin to stdout
  gzip-cli -c -l 9 big.log      Max compression to stdout
  gzip-cli -d -c file.gz | wc   Decompress to stdout, pipe`);
}

let decompress = false;
let toStdout = false;
let keep = false;
let level = 6;
let force = false;
const files = [];

for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '-h' || a === '--help') { usage(); process.exit(0); }
  if (a === '-v' || a === '--version') {
    console.log(require('./package.json').version);
    process.exit(0);
  }
  if (a === '-d' || a === '--decompress') { decompress = true; continue; }
  if (a === '-c' || a === '--stdout') { toStdout = true; continue; }
  if (a === '-k' || a === '--keep') { keep = true; continue; }
  if (a === '-f' || a === '--force') { force = true; continue; }
  if (a === '-l' || a === '--level') {
    level = parseInt(args[++i], 10);
    if (isNaN(level) || level < 1 || level > 9) {
      process.stderr.write('Error: level must be 1-9\n');
      process.exit(1);
    }
    continue;
  }
  // combined short flags like -dk
  if (a.startsWith('-') && !a.startsWith('--') && a.length > 2) {
    for (const c of a.slice(1)) {
      if (c === 'd') decompress = true;
      else if (c === 'c') toStdout = true;
      else if (c === 'k') keep = true;
      else if (c === 'f') force = true;
      else { process.stderr.write(`Unknown flag: -${c}\n`); process.exit(1); }
    }
    continue;
  }
  files.push(a);
}

function compressStream(input, output) {
  return new Promise((resolve, reject) => {
    const gz = zlib.createGzip({ level });
    input.pipe(gz).pipe(output);
    output.on('finish', resolve);
    output.on('error', reject);
    input.on('error', reject);
  });
}

function decompressStream(input, output) {
  return new Promise((resolve, reject) => {
    const gunz = zlib.createGunzip();
    input.pipe(gunz).pipe(output);
    output.on('finish', resolve);
    output.on('error', reject);
    input.on('error', reject);
    gunz.on('error', reject);
  });
}

async function processFile(filePath) {
  if (!fs.existsSync(filePath)) {
    process.stderr.write(`Error: ${filePath} not found\n`);
    process.exit(1);
  }

  const input = fs.createReadStream(filePath);

  if (toStdout) {
    const fn = decompress ? decompressStream : compressStream;
    await fn(input, process.stdout);
    return;
  }

  let outPath;
  if (decompress) {
    if (filePath.endsWith('.gz')) {
      outPath = filePath.slice(0, -3);
    } else {
      process.stderr.write(`Error: ${filePath} doesn't end with .gz\n`);
      process.exit(1);
    }
  } else {
    outPath = filePath + '.gz';
  }

  if (fs.existsSync(outPath) && !force) {
    process.stderr.write(`Error: ${outPath} already exists (use -f to overwrite)\n`);
    process.exit(1);
  }

  const output = fs.createWriteStream(outPath);
  const fn = decompress ? decompressStream : compressStream;
  await fn(input, output);

  if (!keep) {
    fs.unlinkSync(filePath);
  }

  const inSize = fs.statSync(keep ? filePath : outPath).size;
  process.stderr.write(`${filePath} → ${outPath}\n`);
}

async function main() {
  if (files.length === 0) {
    // stdin mode
    if (process.stdin.isTTY && !toStdout) {
      usage();
      process.exit(0);
    }
    const fn = decompress ? decompressStream : compressStream;
    await fn(process.stdin, process.stdout);
  } else {
    for (const f of files) {
      await processFile(f);
    }
  }
}

main().catch(err => {
  process.stderr.write(`Error: ${err.message}\n`);
  process.exit(1);
});
