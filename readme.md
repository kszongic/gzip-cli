# @kszongic/gzip-cli

[![npm version](https://img.shields.io/npm/v/@kszongic/gzip-cli)](https://www.npmjs.com/package/@kszongic/gzip-cli)
[![npm downloads](https://img.shields.io/npm/dm/@kszongic/gzip-cli)](https://www.npmjs.com/package/@kszongic/gzip-cli)
[![license](https://img.shields.io/npm/l/@kszongic/gzip-cli)](./LICENSE)
[![node](https://img.shields.io/node/v/@kszongic/gzip-cli)](https://nodejs.org)
![zero dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)
![platform](https://img.shields.io/badge/platform-win%20%7C%20mac%20%7C%20linux-blue)

Compress and decompress files using gzip from the command line. **Zero dependencies** - uses Node.js built-in `zlib`.

> GNU `gzip` doesn't ship on Windows. This one works everywhere.

## Why?

- **Cross-platform** - Windows, macOS, Linux. Same command, same flags, same behavior.
- **Zero dependencies** - installs in under a second. No native compilation, no `node-gyp`.
- **Familiar interface** - same `-d`, `-c`, `-k`, `-l`, `-f` flags you already know from GNU gzip.
- **Pipe-friendly** - reads stdin, writes stdout. Plays nice with shell pipelines.
- **CI-ready** - one `npx` call, no platform-specific install steps.

## Install

```bash
npm install -g @kszongic/gzip-cli
```

Or run directly without installing:

```bash
npx @kszongic/gzip-cli file.txt
```

## Usage

### Compress a file

```bash
gzip-cli file.txt
# file.txt -> file.txt.gz (original removed)
```

### Decompress

```bash
gzip-cli -d file.txt.gz
# file.txt.gz -> file.txt
```

### Keep the original

```bash
gzip-cli -k file.txt
# Creates file.txt.gz, keeps file.txt
```

### Compress to stdout (pipe-friendly)

```bash
cat access.log | gzip-cli -c > access.log.gz
```

### Decompress to stdout

```bash
gzip-cli -dc archive.gz | grep "ERROR" | wc -l
```

### Maximum compression

```bash
gzip-cli -l 9 database-dump.sql
```

### Force overwrite

```bash
gzip-cli -f file.txt
# Overwrites file.txt.gz if it exists
```

### Multiple files

```bash
gzip-cli *.log
# Compresses each .log file individually
```

### Combined short flags

```bash
gzip-cli -dk archive.gz    # Decompress + keep original
gzip-cli -cf big.txt        # Force compress to stdout
```

## Options

| Flag | Description |
|------|-------------|
| `-d, --decompress` | Decompress (gunzip) mode |
| `-c, --stdout` | Write to stdout instead of creating a file |
| `-k, --keep` | Keep the original file (don't delete it) |
| `-l, --level <n>` | Compression level 1-9 (default: 6) |
| `-f, --force` | Overwrite existing output files |
| `-h, --help` | Show help |
| `-v, --version` | Show version |

## Recipes

### Compress build artifacts before deploy

```bash
# In your CI pipeline
npx @kszongic/gzip-cli -k -l 9 dist/bundle.js dist/styles.css
ls dist/*.gz
# dist/bundle.js.gz  dist/styles.css.gz
```

### Check compression ratio

```bash
wc -c < big-file.json
gzip-cli -c big-file.json | wc -c
```

### Rotate and compress logs

```bash
gzip-cli -k logs/app-2026-03-18.log
```

### Docker multi-stage build

```dockerfile
FROM node:20-alpine AS build
RUN npm install -g @kszongic/gzip-cli
COPY dist/ /app/dist/
RUN gzip-cli -k -l 9 /app/dist/*.js /app/dist/*.css

FROM nginx:alpine
COPY --from=build /app/dist/ /usr/share/nginx/html/
```

### Pair with checksum-verify-cli

```bash
gzip-cli -k dist/*.js
sha256sum dist/*.gz > SHA256SUMS
npx @kszongic/checksum-verify-cli SHA256SUMS --strict
```

### npm scripts

```json
{
  "scripts": {
    "build": "tsc && gzip-cli -k -l 9 dist/*.js",
    "clean:gz": "rm dist/*.gz"
  }
}
```

## How It Works

Uses Node.js built-in `zlib.createGzip()` / `zlib.createGunzip()` with streaming I/O. Files are processed through readable -> transform -> writable stream pipelines. No temp files, no buffering entire files into memory.

| Compression Level | Speed | Size |
|---|---|---|
| `-l 1` | Fastest | Largest |
| `-l 6` (default) | Balanced | Good |
| `-l 9` | Slowest | Smallest |

## Comparison

| Feature | GNU `gzip` | `gzip-cli` | `node-gzip` | PowerShell |
|---|---|---|---|---|
| Cross-platform | Unix only | Win/Mac/Linux | Win/Mac/Linux | Windows only |
| Zero dependencies | N/A | Yes | No (1 dep) | N/A |
| Pipe stdin/stdout | Yes | Yes | No (API only) | No |
| Familiar flags | Yes | Yes (same) | N/A | No |
| Compression levels | 1-9 | 1-9 | 1-9 | No |
| One-line install | Varies | `npx` | `npm` | Built-in |

## Use Cases

- **CI/CD pipelines** - Pre-compress static assets for CDN/nginx `gzip_static`
- **Log management** - Rotate and compress application logs
- **Cross-platform scripts** - One gzip command on every OS
- **Docker builds** - Compress in build stage, serve pre-compressed in production
- **Data pipelines** - Compress/decompress streams between processing steps

## Related

- [@kszongic/checksum-verify-cli](https://github.com/kszongic/checksum-verify-cli) - Verify files against SHA256SUMS/MD5SUMS
- [@kszongic/glob-size-cli](https://github.com/kszongic/glob-size-cli) - Check file sizes by glob pattern
- [@kszongic/humanize-bytes-cli](https://github.com/kszongic/humanize-bytes-cli) - Human-readable byte formatting
- [dep-size](https://github.com/kszongic/dep-size) - Check npm package install size
- [env-lint-cli](https://github.com/kszongic/env-lint-cli) - Lint .env files

## License

MIT (c) kszongic
