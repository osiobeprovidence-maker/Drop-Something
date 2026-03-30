"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

function getMuxCredentials() {
  const tokenId = process.env.MUX_TOKEN_ID || "";
  const tokenSecret = process.env.MUX_TOKEN_SECRET || "";

  if (!tokenId || !tokenSecret) {
    throw new Error("Mux is not configured. Set MUX_TOKEN_ID and MUX_TOKEN_SECRET.");
  }

  return {
    tokenId,
    tokenSecret,
  };
}

function getMuxAuthHeader() {
  const { tokenId, tokenSecret } = getMuxCredentials();
  return `Basic ${Buffer.from(`${tokenId}:${tokenSecret}`).toString("base64")}`;
}

export const createVideoUpload = action({
  args: {
    fileName: v.string(),
    fileSize: v.number(),
  },
  handler: async (_ctx, args) => {
    try {
      const response = await fetch("https://api.mux.com/video/v1/uploads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: getMuxAuthHeader(),
        },
        body: JSON.stringify({
          new_asset_settings: {
            playback_policy: ["public"],
          },
          cors_origin: "*",
          metadata: {
            file_name: args.fileName,
            file_size: args.fileSize.toString(),
          },
        }),
      });

      const data = await response.json();

      if (!data.data) {
        throw new Error(data.errors?.[0]?.message || "Failed to create Mux upload");
      }

      return {
        uploadId: data.data.id,
        uploadUrl: data.data.url,
      };
    } catch (error) {
      console.error("Mux upload error:", error);
      throw error instanceof Error ? error : new Error("Failed to create Mux upload");
    }
  },
});

export const getVideoPlaybackInfo = action({
  args: {
    uploadId: v.string(),
  },
  handler: async (_ctx, args) => {
    try {
      const uploadResponse = await fetch(`https://api.mux.com/video/v1/uploads/${args.uploadId}`, {
        method: "GET",
        headers: {
          Authorization: getMuxAuthHeader(),
        },
      });

      const uploadData = await uploadResponse.json();
      if (!uploadData.data) {
        return {
          status: "error",
          playbackId: null,
          playbackUrl: null,
        };
      }

      const upload = uploadData.data;
      if (!upload.asset_id) {
        return {
          status: "uploading",
          playbackId: null,
          playbackUrl: null,
        };
      }

      const assetResponse = await fetch(`https://api.mux.com/video/v1/assets/${upload.asset_id}`, {
        method: "GET",
        headers: {
          Authorization: getMuxAuthHeader(),
        },
      });

      const assetData = await assetResponse.json();
      if (!assetData.data) {
        return {
          status: "error",
          playbackId: null,
          playbackUrl: null,
        };
      }

      const asset = assetData.data;
      const playbackId = asset.playback_ids?.[0]?.id || null;

      return {
        status: asset.status,
        playbackId,
        playbackUrl: playbackId ? `https://stream.mux.com/${playbackId}.m3u8` : null,
      };
    } catch (error) {
      console.error("Mux playback info error:", error);
      return {
        status: "error",
        playbackId: null,
        playbackUrl: null,
      };
    }
  },
});
