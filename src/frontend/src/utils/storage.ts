/**
 * Object-storage extension wrapper.
 *
 * Uses @caffeineai/object-storage StorageClient to upload files and return
 * storageIds that match the platform's !caf!sha256: format — identical to
 * what @caffeineai/core-infrastructure produces internally.
 *
 * storageId format: "!caf!sha256:<hex-hash>"
 * Display URL:      resolved via getDirectURL(hash) or CDN pattern
 */

import { StorageClient } from "@caffeineai/object-storage";
import { HttpAgent } from "@icp-sdk/core/agent";

const CAFFEINEAI_SENTINEL = "!caf!";
const STORAGE_GATEWAY_URL =
  import.meta.env.STORAGE_GATEWAY_URL || "https://blob.caffeine.ai";

// Backend canister ID injected at build time
const BACKEND_CANISTER_ID =
  (import.meta.env.CANISTER_ID_BACKEND as string) || "";

const BUCKET = "default-bucket";
const PROJECT_ID = "0000000-0000-0000-0000-00000000000";

let _client: StorageClient | null = null;

async function getClient(): Promise<StorageClient> {
  if (_client) return _client;
  try {
    // Try to load env.json for runtime config (same as createActorWithConfig)
    const res = await fetch("/env.json");
    const cfg = (await res.json()) as Record<string, string>;
    const gatewayUrl =
      cfg.storage_gateway_url && cfg.storage_gateway_url !== "undefined"
        ? cfg.storage_gateway_url
        : STORAGE_GATEWAY_URL;
    const canisterId =
      cfg.backend_canister_id && cfg.backend_canister_id !== "undefined"
        ? cfg.backend_canister_id
        : BACKEND_CANISTER_ID;
    const projectId =
      cfg.project_id && cfg.project_id !== "undefined"
        ? cfg.project_id
        : PROJECT_ID;
    const agent = new HttpAgent({});
    _client = new StorageClient(
      BUCKET,
      gatewayUrl,
      canisterId,
      projectId,
      agent,
    );
  } catch {
    const agent = new HttpAgent({});
    _client = new StorageClient(
      BUCKET,
      STORAGE_GATEWAY_URL,
      BACKEND_CANISTER_ID,
      PROJECT_ID,
      agent,
    );
  }
  return _client;
}

/**
 * Upload a File using the object-storage extension.
 * Returns a storageId in !caf!sha256:<hash> format — ready to persist to backend.
 */
export async function uploadFile(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<string> {
  const client = await getClient();
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { hash } = await client.putFile(bytes, onProgress);
  return CAFFEINEAI_SENTINEL + hash;
}

/**
 * Resolve a storageId to a displayable URL.
 * Handles both new !caf!sha256: format and legacy /api/storage/ IDs.
 */
export async function getFileUrl(storageId: string): Promise<string> {
  if (!storageId) return "";
  if (storageId.startsWith(CAFFEINEAI_SENTINEL)) {
    const hash = storageId.slice(CAFFEINEAI_SENTINEL.length);
    try {
      const client = await getClient();
      return await client.getDirectURL(hash);
    } catch {
      return `/api/storage/${storageId}`;
    }
  }
  return `/api/storage/${storageId}`;
}

/**
 * Synchronous URL helper for <img> src attributes.
 * Returns a CDN URL directly without a round-trip.
 */
export function getFileUrlSync(
  storageId: string | undefined | null,
): string | null {
  if (!storageId) return null;
  if (storageId.startsWith(CAFFEINEAI_SENTINEL)) {
    const hash = storageId.slice(CAFFEINEAI_SENTINEL.length);
    // sha256:hex-hash — strip the sha256: prefix for URL path
    const hexHash = hash.startsWith("sha256:") ? hash.slice(7) : hash;
    return `${STORAGE_GATEWAY_URL}/v1/files/${hexHash}`;
  }
  return `/api/storage/${storageId}`;
}
