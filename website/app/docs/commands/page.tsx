import { DocPage } from "@/components/DocPage";

const content = `
IFT provides 16 subcommands organized into four groups: **transfers**, **file operations**, **crypto**, and **system**.

---

## Global Options

These flags apply to every command.

| Flag | Short | Default | Description |
|------|-------|---------|-------------|
| \`--format\` | \`-f\` | \`text\` | Output format: \`text\`, \`json\`, \`quiet\` |
| \`--agent\` | | \`false\` | Agent mode — JSON output, no interactive elements |
| \`--verbose\` | \`-v\` | \`false\` | Verbose logging |
| \`--quiet\` | \`-q\` | \`false\` | Suppress all non-error output |
| \`--parallel\` | | \`4\` | Parallel connections for chunked transfers (1–256) |
| \`--retries\` | | \`3\` | Max retry attempts (0–100) |
| \`--retry-delay-ms\` | | \`1000\` | Initial retry delay in ms (exponential backoff) |
| \`--connect-timeout\` | | \`30\` | Connection timeout in seconds (0–3600) |
| \`--timeout\` | | \`0\` | Transfer timeout in seconds (0 = unlimited) |
| \`--insecure\` | | \`false\` | Skip TLS certificate verification |
| \`--rate-limit\` | | \`0\` | Max bandwidth bytes/sec (0 = unlimited) |
| \`--turbo\` | | \`false\` | Enable turbo transfer engine |
| \`--streams\` | | \`0\` | Parallel streams in turbo mode (0 = auto) |
| \`--chunk-size\` | | \`0\` | Chunk size in bytes for turbo (0 = adaptive) |
| \`--sock-buf\` | | \`0\` | Socket buffer size for turbo (0 = auto BDP) |
| \`--no-mmap\` | | \`false\` | Disable memory-mapped I/O in turbo mode |
| \`--pin-cert\` | | | Pin TLS cert by SHA-256 fingerprint (hex) |
| \`--ca-bundle\` | | | Path to custom CA certificate bundle (PEM) |

---

## Transfer Commands

### \`ift get\` — Download a file

Download a file from any supported protocol.

\`\`\`bash
ift get <URL> [OPTIONS]
\`\`\`

| Option | Short | Default | Description |
|--------|-------|---------|-------------|
| \`--output\` | \`-o\` | | Output file or directory path |
| \`--resume\` | | \`false\` | Resume a partially downloaded file |
| \`--checksum\` | | | Verify with algorithm: \`sha256\`, \`sha512\`, \`md5\` |
| \`--checksum-value\` | | | Expected checksum hex value |
| \`--header\` | \`-H\` | | Custom HTTP header (\`key:value\`, repeatable) |
| \`--bearer-token\` | | | Bearer token for authentication |
| \`--auth\` | | | Basic auth credentials (\`user:password\`) |
| \`--user-agent\` | | | Custom User-Agent string |
| \`--max-redirects\` | | \`10\` | Maximum HTTP redirects to follow |

**Examples:**

\`\`\`bash
ift get https://example.com/file.tar.gz
ift get https://example.com/file.tar.gz -o ./downloads/
ift get https://example.com/release.tar.gz --checksum sha256 --checksum-value e3b0c44...
ift get aftp://server:2600/data.bin --turbo --streams 64
ift get https://example.com/large.iso --resume
\`\`\`

---

### \`ift put\` — Upload a file

Upload a local file to a remote destination.

\`\`\`bash
ift put <SOURCE> <URL> [OPTIONS]
\`\`\`

| Option | Short | Default | Description |
|--------|-------|---------|-------------|
| \`--content-type\` | | | Content-Type header for the upload |
| \`--header\` | \`-H\` | | Custom HTTP header (repeatable) |
| \`--bearer-token\` | | | Bearer token for authentication |
| \`--auth\` | | | Basic auth credentials (\`user:password\`) |
| \`--method\` | | \`PUT\` | HTTP method for the upload |

**Examples:**

\`\`\`bash
ift put ./report.pdf https://upload.example.com/files/
ift put ./data.json https://api.example.com/upload --method POST --content-type application/json
ift put ./report.pdf aftp://server:2600/report.pdf
\`\`\`

---

### \`ift copy\` — Copy files between locations

Copy files between any two locations — local or remote.

\`\`\`bash
ift copy <SOURCE> <DESTINATION> [OPTIONS]
\`\`\`

| Option | Short | Default | Description |
|--------|-------|---------|-------------|
| \`--recursive\` | \`-r\` | \`false\` | Recurse into directories |
| \`--include\` | | | Include glob patterns (repeatable) |
| \`--exclude\` | | | Exclude glob patterns (repeatable) |
| \`--preserve\` | | \`false\` | Preserve modification timestamps |
| \`--dry-run\` | | \`false\` | Show what would be done |

**Examples:**

\`\`\`bash
ift copy ./src/ ./backup/src/
ift copy -r ./project/ sftp://server/backups/project/
ift copy -r ./data/ ./out/ --include "*.csv" --exclude "temp/*"
\`\`\`

---

### \`ift sync\` — Synchronize directories

One-way directory synchronization with rsync/rclone-class features.

\`\`\`bash
ift sync <SOURCE> <DESTINATION> [OPTIONS]
\`\`\`

| Option | Short | Default | Description |
|--------|-------|---------|-------------|
| \`--compare\` | | \`modtime\` | Compare mode: \`size\`, \`modtime\`, \`checksum\` |
| \`--dry-run\` | | \`false\` | Preview changes without applying |
| \`--delete\` | | \`false\` | Delete extraneous files at destination |
| \`--update\` | | \`false\` | Only copy if source is newer |
| \`--preserve\` | | \`false\` | Preserve modification timestamps |
| \`--include\` | | | Include glob patterns (repeatable) |
| \`--exclude\` | | | Exclude glob patterns (repeatable) |
| \`--min-size\` | | | Minimum file size in bytes |
| \`--max-size\` | | | Maximum file size in bytes |
| \`--max-depth\` | | \`0\` | Maximum directory depth (0 = unlimited) |

**Examples:**

\`\`\`bash
ift sync ./project/ sftp://server/backup/project/
ift sync ./src/ ./dst/ --dry-run
ift sync ./src/ ./dst/ --delete
ift sync ./src/ ./dst/ --include "*.rs" --exclude "target/*"
ift sync ./src/ ./dst/ --compare checksum
\`\`\`

---

### \`ift head\` — Inspect resource metadata

Retrieve metadata (size, type, headers) without downloading.

\`\`\`bash
ift head <URL> [OPTIONS]
\`\`\`

| Option | Short | Default | Description |
|--------|-------|---------|-------------|
| \`--header\` | \`-H\` | | Custom HTTP header (repeatable) |
| \`--bearer-token\` | | | Bearer token for authentication |

**Examples:**

\`\`\`bash
ift head https://example.com/file.tar.gz
ift head aftp://server:2600/data.bin
\`\`\`

---

## File Operation Commands

### \`ift ls\` — List directory contents

List files and directories at a local or remote path.

\`\`\`bash
ift ls <URL> [OPTIONS]
\`\`\`

| Option | Short | Default | Description |
|--------|-------|---------|-------------|
| \`--recursive\` | \`-r\` | \`false\` | List recursively |
| \`--long\` | \`-l\` | \`false\` | Long format (size, time, permissions) |

**Examples:**

\`\`\`bash
ift ls ./my-directory/
ift ls aftp://server:2600/
ift ls -r -l ./project/
\`\`\`

---

### \`ift mv\` — Move or rename

Move or rename files and directories across protocols.

\`\`\`bash
ift mv <SOURCE> <DESTINATION>
\`\`\`

**Examples:**

\`\`\`bash
ift mv ./old-name.txt ./new-name.txt
ift mv ./file.pdf sftp://server/archive/file.pdf
\`\`\`

---

### \`ift rm\` — Remove files and directories

Delete files or directories at any supported location.

\`\`\`bash
ift rm <URL> [OPTIONS]
\`\`\`

| Option | Short | Default | Description |
|--------|-------|---------|-------------|
| \`--recursive\` | \`-r\` | \`false\` | Remove directories recursively |
| \`--force\` | | \`false\` | Force removal without confirmation |

**Examples:**

\`\`\`bash
ift rm ./temp-file.txt
ift rm ./build-output/ --recursive
\`\`\`

---

### \`ift mkdir\` — Create directories

Create directories, including parent directories, at any location.

\`\`\`bash
ift mkdir <URL>
\`\`\`

**Examples:**

\`\`\`bash
ift mkdir ./new-dir/sub-dir/
ift mkdir sftp://server/uploads/batch-001/
\`\`\`

---

### \`ift checksum\` — Compute file checksum

Compute a cryptographic hash of a local file.

\`\`\`bash
ift checksum <PATH> [OPTIONS]
\`\`\`

| Option | Short | Default | Description |
|--------|-------|---------|-------------|
| \`--algorithm\` | \`-a\` | \`sha256\` | Algorithm: \`sha256\`, \`sha512\`, \`md5\` |

**Examples:**

\`\`\`bash
ift checksum ./file.tar.gz --algorithm sha256
ift checksum ./release.bin -a sha512
\`\`\`

---

## Server Command

### \`ift serve\` — Start an AFTP file server

Serve a directory over AFTP with optional TLS, authentication, and compression.

\`\`\`bash
ift serve <ROOT> [OPTIONS]
\`\`\`

| Option | Default | Description |
|--------|---------|-------------|
| \`--port\` | \`2600\` | TCP port to listen on |
| \`--bind\` | \`0.0.0.0\` | Address to bind to |
| \`--auth-token\` | | Pre-shared authentication token |
| \`--auth-challenge\` | \`false\` | HMAC-SHA256 challenge/response auth |
| \`--compression\` | \`false\` | Enable zstd compression |
| \`--tls-cert\` | | TLS certificate PEM file (enables AFTPS) |
| \`--tls-key\` | | TLS private key PEM file |
| \`--transport\` | \`tcp\` | Transport: \`tcp\`, \`ws\`, or \`quic\` |
| \`--rate-limit\` | \`0\` | Max bandwidth bytes/sec (0 = unlimited) |
| \`--max-connections\` | \`1000\` | Max concurrent connections (0 = unlimited) |

**Examples:**

\`\`\`bash
# Basic server
ift serve ./files

# With TLS and authentication
ift serve ./files --tls-cert cert.pem --tls-key key.pem --auth-token SECRET

# HMAC challenge/response auth with compression
ift serve ./files --auth-token SECRET --auth-challenge --compression

# QUIC transport
ift serve ./files --transport quic --tls-cert cert.pem --tls-key key.pem
\`\`\`

---

## Crypto Commands

All crypto operations are under the \`ift crypto\` subcommand.

### \`ift crypto keygen\` — Generate a key pair

Generate a post-quantum key pair (Kyber1024 / ML-KEM).

\`\`\`bash
ift crypto keygen [OPTIONS]
\`\`\`

| Option | Short | Default | Description |
|--------|-------|---------|-------------|
| \`--output\` | \`-o\` | \`ift_key\` | Output base name (creates \`.pub\` and \`.sec\` files) |

---

### \`ift crypto train\` — Train a neural cipher

Train a neural network cipher model (MLP autoencoder).

\`\`\`bash
ift crypto train [OPTIONS]
\`\`\`

| Option | Short | Default | Description |
|--------|-------|---------|-------------|
| \`--epochs\` | | \`5000\` | Number of training epochs |
| \`--learning-rate\` | | \`0.01\` | Learning rate |
| \`--seed\` | | \`42\` | Random seed for deterministic training |
| \`--output\` | \`-o\` | \`cipher.nn\` | Output model file path |

---

### \`ift crypto encrypt\` — Encrypt a file

Encrypt a file using PQC, neural, or hybrid mode.

\`\`\`bash
ift crypto encrypt <INPUT> [OPTIONS]
\`\`\`

| Option | Short | Default | Description |
|--------|-------|---------|-------------|
| \`--output\` | \`-o\` | input + \`.enc\` | Output file path |
| \`--method\` | \`-m\` | \`pqc\` | Encryption method: \`pqc\`, \`neural\`, \`hybrid\` |
| \`--key-file\` | \`-k\` | | Key file (\`.pub\` for PQC, \`.nn\` for neural) |

**Examples:**

\`\`\`bash
ift crypto encrypt -i secret.pdf -o secret.enc --method pqc -k ./keys/aft_public.key
ift crypto encrypt -i data.bin --method neural -k ./model/cipher.nn
ift crypto encrypt -i payload.tar --method hybrid -k ./keys/aft_public.key
\`\`\`

---

### \`ift crypto decrypt\` — Decrypt a file

Decrypt a previously encrypted file.

\`\`\`bash
ift crypto decrypt <INPUT> [OPTIONS]
\`\`\`

| Option | Short | Default | Description |
|--------|-------|---------|-------------|
| \`--output\` | \`-o\` | input without \`.enc\` | Output file path |
| \`--key-file\` | \`-k\` | | Key file (\`.sec\` for PQC, \`.nn\` for neural) |

---

## Plugin Commands

Manage runtime-loadable protocol handler plugins. All plugins are under \`ift plugin\`.

### \`ift plugin list\` — List loaded plugins

\`\`\`bash
ift plugin list
\`\`\`

### \`ift plugin load\` — Load a plugin

\`\`\`bash
ift plugin load <PATH>
\`\`\`

Loads a shared library (\`.dll\`, \`.so\`, \`.dylib\`) as a protocol handler. Plugins are SHA-256 signature verified.

### \`ift plugin unload\` — Unload a plugin

\`\`\`bash
ift plugin unload <SCHEME>
\`\`\`

Unloads a plugin by its registered protocol scheme.

---

## Telemetry Commands

Manage anonymous telemetry collection. All commands are under \`ift telemetry\`.

| Command | Description |
|---------|-------------|
| \`ift telemetry status\` | Show telemetry status and collected data |
| \`ift telemetry opt-in\` | Enable anonymous telemetry (off by default) |
| \`ift telemetry opt-out\` | Disable anonymous telemetry (default) |
| \`ift telemetry reset\` | Generate a new anonymous installation ID |
| \`ift telemetry sync\` | Manually sync telemetry to remote endpoint |
| \`ift telemetry clear\` | Clear local telemetry records |
| \`ift telemetry export\` | Export telemetry records to a file |
| \`ift telemetry config\` | Configure telemetry endpoint and API key |

### \`ift telemetry export\` options

| Option | Short | Default | Description |
|--------|-------|---------|-------------|
| \`--output\` | \`-o\` | stdout | Output file path |
| \`--format\` | \`-f\` | \`json\` | Export format: \`json\`, \`jsonl\` |
| \`--limit\` | \`-n\` | all | Maximum records to export |

### \`ift telemetry config\` options

| Option | Description |
|--------|-------------|
| \`--endpoint\` | Set the remote endpoint URL |
| \`--api-key\` | Set the API key for authenticated endpoints |

---

## Discovery Commands

### \`ift schema\` — Output agentic ontology

Outputs a JSON-LD ontology schema describing all IFT capabilities, operations, and data types for AI agent tool registration.

\`\`\`bash
ift schema
ift --agent schema
\`\`\`

### \`ift capabilities\` — List available features

Lists all supported protocols, operations, and features in a structured format.

\`\`\`bash
ift capabilities
ift --agent capabilities
\`\`\`

---

## Supported Protocols

| Scheme | Protocol | Ranges | Resume | Auth |
|--------|----------|--------|--------|------|
| \`http://\`, \`https://\` | HTTP/HTTPS | Yes | Yes | Bearer, Basic |
| \`ftp://\`, \`ftps://\` | FTP/FTPS | Yes | Yes | Username/Password |
| \`sftp://\`, \`scp://\` | SFTP/SCP | No | No | Key, Password |
| \`s3://\` | Amazon S3 | Yes | Yes | AWS credentials |
| \`aftp://\`, \`aftps://\` | AFTP (custom) | Yes | Yes | Token, HMAC challenge |
| \`webdav://\`, \`dav://\` | WebDAV | Yes | Yes | Bearer, Basic |
| \`az://\`, \`azblob://\` | Azure Blob Storage | Yes | Yes | Shared Key, SAS |
| \`gs://\` | Google Cloud Storage | Yes | Yes | Bearer token |
| \`smb://\` | SMB/CIFS | No | No | UNC, smbclient |
| \`dod://\` | DoD CDS (HTTPS) | Yes | Yes | Classification header |
| \`file://\`, paths | Local filesystem | Yes | Yes | OS permissions |
`;

export default function CommandsPage() {
  return (
    <DocPage
      title="Commands Reference"
      subtitle="Complete reference for all 16 commands, subcommands, and global flags."
      content={content}
    />
  );
}
