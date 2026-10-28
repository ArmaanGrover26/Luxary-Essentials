/**
 * Secret Admin Portal Configuration
 *
 * Change `ADMIN_SECRET_SLUG` here (or set NEXT_PUBLIC_ADMIN_SECRET_SLUG in .env.local)
 * to change the secret admin URL across the ENTIRE application in a single place.
 *
 * Anyone trying to access `/admin` directly will see a 404 Not Found page.
 * Only those who know `/<ADMIN_SECRET_SLUG>` can access the admin login and dashboard.
 */
export const ADMIN_SECRET_SLUG =
  process.env.ADMIN_SECRET_SLUG || "secret-owner-portal";

/**
 * Returns the secret URL path for any admin sub-path.
 * E.g. getAdminUrl("/products") => "/secret-owner-portal/products"
 */
export function getAdminUrl(path = ""): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (cleanPath === "/" || cleanPath === "") {
    return `/${ADMIN_SECRET_SLUG}`;
  }
  return `/${ADMIN_SECRET_SLUG}${cleanPath}`;
}
