import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
  path: "/getImage",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const storageId = url.searchParams.get("storageId");

    if (!storageId) {
      return new Response("Missing storageId", { status: 400 });
    }

    const blob = await ctx.storage.get(storageId as any);
    if (!blob) {
      return new Response("Image not found", { status: 404 });
    }

    return new Response(blob, {
      headers: {
        "Cache-Control": "public, max-age=31536000",
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
      return new Response("Missing url", { status: 400 });
    }

    // Fetch the file server-side (no CORS restrictions)
    const response = await fetch(fileUrl);
    if (!response.ok) {
      return new Response("Failed to fetch file", { status: 502 });
    }

    const blob = await response.blob();
    const contentType = response.headers.get("content-type") || "application/octet-stream";

    return new Response(blob, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }),
});

export default http;
