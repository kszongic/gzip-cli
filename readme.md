# @kszongic/gzip-cli

[![npm version](https://img.shields.io/npm/v/@kszongic/gzip-cli)](https://www.npmjs.com/package/@kszongic/gzip-cli)
[![license](https://img.shields.io/npm/l/@kszongic/gzip-cli)](./LICENSE)

Compress and decompress files using gzip from the command line. Zero dependencies — uses Node.js built-in `zlib`.

## Install

```bash
npm install -g @kszongic/gzip-cli
```

## Usage

```bash
# Compress a file (creates file.txt.gz, removes original)
gzip-cli file.txt

# Decompress
gzip-cli -d file.txt.gz

# Keep original file
gzip-cli -k file.txt

# Compress to stdout (pipe-friendly)
cat file.txt | gzip-cli -c > file.gz

# Decompress to stdout
gzip-cli -dc file.txt.gz | wc -l

# Max compression
gzip-cli -l 9 file.txt

# Force overwrite
gzip-cli -f file.txt

# Multiple files
gzip-cli *.log
```

## Options

| Flag | Description |
|------|-------------|
| `-d, --decompress` | Decompress (gunzip) mode |
| `-c, --stdout` | Write to stdout |
| `-k, --keep` | Keep original file |
| `-l, --level <n>` | Compression level 1-9 (default: 6) |
| `-f, --force` | Overwrite existing files |
| `-h, --help` | Show help |
| `-v, --version` | Show version |

## Why?

- **Zero dependencies** — just Node.js builtins
- **Cross-platform** — works on Windows, macOS, Linux
- **Pipe-friendly** — reads stdin, writes stdout
- **Familiar** — same flags as GNU gzip

## License

MIT © kszongic
