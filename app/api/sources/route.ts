import { SOURCES, WATCHLIST } from "../../lib/sources";
import { corsJson, corsOptions } from "../../lib/cors";

export async function GET(request: Request) {
  return corsJson(request, { sources: SOURCES, watchlist: WATCHLIST });
}

export async function OPTIONS(request: Request) { return corsOptions(request); }

