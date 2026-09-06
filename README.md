# pi-footer

[pi](https://github.com/earendil-works/pi-mono) extension that replaces the
built-in footer with exact decode throughput, cache stats, and cost.

Footer stats line looks like:

```text
↑88k ↓43k R5.2M 78 t/s CH99.9% AVGCH99.9% $0.069 7.3%/1.0M (auto)
```

Segments:

| Segment | Meaning |
|---|---|
| `↑` / `↓` | Session input / output tokens |
| `R` / `W` | Session cache reads / writes |
| `t/s` | Exact decode rate of last reply (output tokens over stream window) |
| `CH` | Last-turn cache hit ratio (red on cache miss) |
| `AVGCH` | Session-wide cache hit ratio (cache reads over all prompt tokens) |
| `$` | Session cost |
| `%/1.0M` | Context usage |

## Install

```bash
pi install npm:@iaziz786/pi-footer
# or from git:
pi install git:github.com/iAziz786/pi-footer
```

## Develop

```bash
bun install
bun test
```

Publish runs on version tags (`v*`) via trusted publishing; tag must match
`package.json` version.
