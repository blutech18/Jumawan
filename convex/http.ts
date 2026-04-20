import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();

/** Required on every response so cross-origin fetch() does not fail CORS on 4xx/5xx. */
const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
};

http.route({
  path: "/getImage",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const storageId = url.searchParams.get("storageId");

    if (!storageId) {
      return new Response("Missing storageId", { status: 400, headers: CORS });
    }

    const blob = await ctx.storage.get(storageId as any);
    if (!blob) {
      return new Response("Image not found", { status: 404, headers: CORS });
    }

    return new Response(blob, {
      headers: {
        "Cache-Control": "public, max-age=31536000",
        ...CORS,
      },
    });
  }),
});

http.route({
  path: "/downloadFile",
  method: "GET",
  handler: httpAction(async (_ctx, request) => {
    const url = new URL(request.url);
    const fileUrl = url.searchParams.get("url");
    const filename = url.searchParams.get("filename") || "download";

    if (!fileUrl) {
      return new Response("Missing url", { status: 400, headers: CORS });
    }

    // Fetch the file server-side (no CORS restrictions)
    const response = await fetch(fileUrl);
    if (!response.ok) {
      return new Response("Failed to fetch file", { status: 502, headers: CORS });
    }

    const blob = await response.blob();
    const contentType = response.headers.get("content-type") || "application/octet-stream";

    return new Response(blob, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache",
        ...CORS,
      },
    });
  }),
});

// Download directly from Convex storage by storageId — avoids self-referencing
// HTTP fetch that breaks the /downloadFile proxy when the file lives in Convex.
http.route({
  path: "/downloadByStorageId",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const storageId = url.searchParams.get("storageId");
    const filename = url.searchParams.get("filename") || "Jumawan-Resume";

    if (!storageId) {
      return new Response("Missing storageId", { status: 400, headers: CORS });
    }

    const blob = await ctx.storage.get(storageId as any);
    if (!blob) {
      return new Response("File not found", { status: 404, headers: CORS });
    }

    const contentType = blob.type || "application/octet-stream";
    const mimeToExt: Record<string, string> = {
      "application/pdf": "pdf",
      "image/jpeg": "jpg",
      "image/jpg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
      "application/msword": "doc",
    };
    const ext = mimeToExt[contentType.split(";")[0].trim()] || "pdf";
    const finalFilename = `${filename}.${ext}`;

    return new Response(blob, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${finalFilename}"`,
        "Cache-Control": "no-cache",
        ...CORS,
      },
    });
  }),
});

export default http;
