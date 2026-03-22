import { ConvexHttpClient } from "convex/browser";

const convexUrl = import.meta.env.VITE_CONVEX_URL as string;

export const convexClient = new ConvexHttpClient(convexUrl);
