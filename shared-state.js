"use strict";

class SharedStateError extends Error {}

// z1 uses DEFLATE + Base64URL; unprefixed JSON links remain readable.
const compressedStatePrefix = "z1.";

async function encodeSharedState(state) {
  if (typeof CompressionStream !== "function") {
    throw new SharedStateError("此瀏覽器不支援網址壓縮，請使用最新版瀏覽器。");
  }
  try {
    const stream = new Blob([JSON.stringify(state)]).stream()
      .pipeThrough(new CompressionStream("deflate"));
    const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
    const binary = Array.from(bytes, byte => String.fromCharCode(byte)).join("");
    return compressedStatePrefix + btoa(binary)
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  } catch (error) {
    if (!(error instanceof TypeError) && !(error instanceof DOMException)) throw error;
    throw new SharedStateError("分享設定壓縮失敗，請重試或更新瀏覽器。");
  }
}

async function decodeSharedState(value) {
  let json = value;
  if (value.startsWith(compressedStatePrefix)) {
    if (typeof DecompressionStream !== "function") {
      throw new SharedStateError("此瀏覽器不支援網址解壓縮，請使用最新版瀏覽器。");
    }
    const payload = value.slice(compressedStatePrefix.length);
    if (!/^[A-Za-z0-9_-]+$/.test(payload) || payload.length % 4 === 1) {
      throw new SharedStateError("分享網址的壓縮參數格式錯誤。");
    }
    try {
      const binary = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
      const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
      const stream = new Blob([bytes]).stream()
        .pipeThrough(new DecompressionStream("deflate"));
      json = new TextDecoder("utf-8", { fatal: true })
        .decode(await new Response(stream).arrayBuffer());
    } catch (error) {
      if (!(error instanceof TypeError) && !(error instanceof DOMException)) throw error;
      throw new SharedStateError("分享網址的壓縮資料已損壞，請重新取得連結。");
    }
  } else if (/^z\d+\./.test(value)) {
    throw new SharedStateError("分享網址的壓縮版本不支援。");
  }
  try {
    return JSON.parse(json);
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
    throw new SharedStateError("網址中的設定不是有效的 JSON。");
  }
}

function createShareControls({ baseUrl, getState, validateState }) {
  const result = document.getElementById("share-result");
  const input = document.getElementById("share-url");
  const status = document.getElementById("share-status");
  const stateError = document.getElementById("state-error");
  let shareRevision = 0;

  input.addEventListener("click", () => input.select());

  function invalidateShareUrl() {
    shareRevision++;
    result.hidden = true;
    input.value = "";
    status.textContent = "";
    status.className = "muted";
  }

  async function generateShareUrl() {
    invalidateShareUrl();
    const revision = shareRevision;
    stateError.hidden = true;
    try {
      const state = getState();
      validateState(state);
      const encodedState = await encodeSharedState(state);
      if (revision !== shareRevision) return;
      const url = new URL(baseUrl);
      url.searchParams.set("state", encodedState);
      input.value = url.href;
      result.hidden = false;
      input.focus();
      input.select();
      if (typeof navigator.clipboard?.writeText !== "function") {
        status.className = "error";
        status.textContent = "網址已產生，但此瀏覽器不支援自動複製。請手動複製網址欄位。";
        return;
      }
      status.textContent = "網址已產生，正在複製至剪貼簿…";
      try {
        await navigator.clipboard.writeText(url.href);
        if (revision !== shareRevision) return;
        status.textContent = "分享網址已複製到剪貼簿，可直接貼上分享。連結記錄的是產生當下的設定。";
      } catch (error) {
        if (!(error instanceof DOMException)) throw error;
        if (revision !== shareRevision) return;
        status.className = "error";
        status.textContent = "網址已產生，但瀏覽器未允許自動複製。請允許剪貼簿權限，或手動複製網址欄位。";
      }
    } catch (error) {
      if (!(error instanceof SharedStateError)) throw error;
      if (revision !== shareRevision) return;
      stateError.textContent = `無法產生分享網址：${error.message}`;
      stateError.hidden = false;
    }
  }

  return { invalidateShareUrl, generateShareUrl };
}
