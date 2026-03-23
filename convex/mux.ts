import { action } from "./_generated/server";
import { v } from "convex/values";
import { Mux } from "@mux/mux-node";

// Initialize Mux client
// Token ID: f3eecb08-16b6-426d-b9ba-906ab2193732
// Token Secret should be set in environment variables
const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID || "f3eecb08-16b6-426d-b9ba-906ab2193732",
  tokenSecret: process.env.MUX_TOKEN_SECRET || "",
});

// Create a Mux direct upload for video
export const createMuxUpload = action({
  args: {
    fileName: v.string(),
    fileSize: v.number(),
  },
  handler: async (ctx, args) => {
    try {
      const upload = await mux.video.uploads.create({
        new_asset_settings: {
          playback_policy: ["public"],
        },
        cors_origin: "*",
        metadata: {
          file_name: args.fileName,
          file_size: args.fileSize.toString(),
        },
      });

      return {
        uploadId: upload.id,
        uploadUrl: upload.url,
      };
    } catch (error) {
      console.error("Error creating Mux upload:", error);
      throw new Error("Failed to create Mux upload");
    }
  },
});

// Get Mux asset status
export const getMuxAssetStatus = action({
  args: {
    uploadId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const upload = await mux.video.uploads.retrieve(args.uploadId);
      
      if (!upload.asset_id) {
        return {
          status: "uploading",
          playbackId: null,
        };
      }

      const asset = await mux.video.assets.retrieve(upload.asset_id);
      
      return {
        status: asset.status,
        playbackId: asset.playback_ids?.[0]?.id || null,
      };
    } catch (error) {
      console.error("Error getting Mux asset status:", error);
      return {
        status: "error",
        playbackId: null,
      };
    }
  },
});

// Get Mux playback URL
export const getMuxPlaybackUrl = action({
  args: {
    playbackId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const playbackUrl = `https://stream.mux.com/${args.playbackId}.m3u8`;
      return { playbackUrl };
    } catch (error) {
      console.error("Error getting Mux playback URL:", error);
      throw new Error("Failed to get Mux playback URL");
    }
  },
});

// Delete Mux asset
export const deleteMuxAsset = action({
  args: {
    assetId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      await mux.video.assets.delete(args.assetId);
      return { success: true };
    } catch (error) {
      console.error("Error deleting Mux asset:", error);
      throw new Error("Failed to delete Mux asset");
    }
  },
});
