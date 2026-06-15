import { PUBLIC_BUILD_TIME } from '$env/static/public';

/** ISO 8601 UTC timestamp set at build time via PUBLIC_BUILD_TIME. */
export const BUILD_TIME = PUBLIC_BUILD_TIME || null;
