// Copyright (c) 2024-2026 Nervosys LLC
// SPDX-License-Identifier: AGPL-3.0-or-later
//! Configuration file support (~/.aft/config.toml).
//!
//! Loads default settings from a TOML file so users don't need to
//! specify common options on every invocation.

use serde::Deserialize;

use crate::error::{IftError, IftResult};

/// Top-level configuration structure mirroring CLI global options.
#[derive(Debug, Deserialize, Default)]
#[serde(default)]
pub struct IftConfig {
    /// Default output format ("text", "json", "quiet")
    pub format: Option<String>,
    /// Number of parallel connections
    pub parallel: Option<usize>,
    /// Maximum retry attempts
    pub retries: Option<u32>,
    /// Retry delay in milliseconds
    pub retry_delay_ms: Option<u64>,
    /// Connection timeout in seconds
    pub connect_timeout: Option<u64>,
    /// Transfer timeout in seconds (0 = none)
    pub timeout: Option<u64>,
    /// Skip TLS verification
    pub insecure: Option<bool>,
    /// Maximum bandwidth in bytes/sec (0 = unlimited)
    pub rate_limit: Option<u64>,
    /// Default user agent string
    pub user_agent: Option<String>,
    /// Default bearer token
    pub bearer_token: Option<String>,

    /// AFTP server settings
    pub server: Option<ServerConfig>,
}

/// Server-specific configuration.
#[derive(Debug, Deserialize, Default)]
#[serde(default)]
pub struct ServerConfig {
    pub port: Option<u16>,
    pub bind: Option<String>,
    pub compression: Option<bool>,
    pub tls_cert: Option<String>,
    pub tls_key: Option<String>,
    pub auth_token: Option<String>,
}

/// Returns `~/.aft/config.toml` path, or None if home dir is unavailable.
pub fn config_path() -> Option<std::path::PathBuf> {
    dirs::home_dir().map(|h| h.join(".aft").join("config.toml"))
}

/// Load configuration from `~/.aft/config.toml`. Returns default if file doesn't exist.
pub fn load_config() -> IftResult<IftConfig> {
    let path = match config_path() {
        Some(p) => p,
        None => return Ok(IftConfig::default()),
    };

    if !path.exists() {
        return Ok(IftConfig::default());
    }

    // Warn if config file is world-readable (may contain tokens/keys)
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        if let Ok(meta) = std::fs::metadata(&path) {
            let mode = meta.permissions().mode();
            if mode & 0o077 != 0 {
                eprintln!(
                    "Warning: {} is accessible to other users (mode {:04o}). \
                     Consider: chmod 600 {}",
                    path.display(),
                    mode & 0o777,
                    path.display()
                );
            }
        }
    }

    let content = std::fs::read_to_string(&path)
        .map_err(|e| IftError::Other(format!("Failed to read config {}: {}", path.display(), e)))?;

    let config: IftConfig = toml::from_str(&content)
        .map_err(|e| IftError::Other(format!("Invalid config {}: {}", path.display(), e)))?;

    Ok(config)
}

/// Ensure the `~/.aft/` directory exists.
pub fn ensure_ift_dir() -> IftResult<std::path::PathBuf> {
    let dir = dirs::home_dir()
        .ok_or_else(|| IftError::Other("Cannot determine home directory".into()))?
        .join(".aft");

    if !dir.exists() {
        std::fs::create_dir_all(&dir)
            .map_err(|e| IftError::Other(format!("Cannot create ~/.aft: {}", e)))?;
    }

    Ok(dir)
}

impl IftConfig {
    /// Validate configuration values are within sane bounds.
    pub fn validate(&self) -> IftResult<()> {
        if let Some(p) = self.parallel {
            if p == 0 || p > 256 {
                return Err(IftError::Other(
                    "Config error: 'parallel' must be 1–256".into(),
                ));
            }
        }
        if let Some(t) = self.connect_timeout {
            if t > 3600 {
                return Err(IftError::Other(
                    "Config error: 'connect_timeout' must be 0–3600".into(),
                ));
            }
        }
        if let Some(r) = self.retries {
            if r > 100 {
                return Err(IftError::Other(
                    "Config error: 'retries' must be 0–100".into(),
                ));
            }
        }
        Ok(())
    }
}
