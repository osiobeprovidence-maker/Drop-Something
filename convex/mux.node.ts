"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

// Mux configuration
// Token ID: f3eecb08-16b6-426d-b9ba-906ab2193732
// Token Secret should be set in environment variables as MUX_TOKEN_SECRET

// Create a Mux direct upload for video
export const createVideoUpload = action({
  args: {
    fileName: v.string(),
    fileSize: v.number(),
  },
  handler: async (ctx, args) => {
    const tokenId = "f3eecb08-16b6-426d-b9ba-906ab2193732";
    const tokenSecret = process.env.MUX_TOKEN_SECRET || "";
    
    if (!tokenSecret) {
      throw new Error("MUX_TOKEN_SECRET not configured");
    }

    try {
      // Create upload using Mux API
      const response = await fetch("https://api.mux.com/video/v1/uploads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Basic " + Buffer.from(`${tokenId}:${tokenSecret}`).toString("base64"),
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
      throw new Error("Failed to create Mux upload");
    }
  },
});

// Get Mux playback info after upload completes
export const getVideoPlaybackInfo = action({
  args: {
    uploadId: v.string(),
  },
  handler: async (ctx, args) => {
    const tokenId = "f3eecb08-16b6-426d-b9ba-906ab2193732";
    const tokenSecret = process.env.MUX_TOKEN_SECRET || "";
    
    if (!tokenSecret) {
      return {
        status: "error",
        playbackId: null,
        playbackUrl: null,
      };
    }

    try {
      // Get upload status
      const response = await fetch(`https://api.mux.com/video/v1/uploads/${args.uploadId}`, {
        method: "GET",
        headers: {
          "Authorization": "Basic " + Buffer.from(`${tokenId}:${tokenSecret}`).toString("base64"),
        },
      });

      const data = await response.json();

      if (!data.data) {
        return {
          status: "error",
          playbackId: null,
          playbackUrl: null,
        };
      }

      const upload = data.data;
      
      if (!upload.asset_id) {
        return {
          status: "uploading",
          playbackId: null,
          playbackUrl: null,
        };
      }

      // Get asset info
      const assetResponse = await fetch(`https://api.mux.com/video/v1/assets/${upload.asset_id}`, {
        method: "GET",
        headers: {
          "Authorization": "Basic " + Buffer.from(`${tokenId}:${tokenSecret}`).toString("base64"),
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
