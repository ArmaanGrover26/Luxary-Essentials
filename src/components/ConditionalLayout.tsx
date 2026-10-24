"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InventoryToast from "@/components/ui/InventoryToast";
import WishlistToast from "@/components/ui/WishlistToast";
import { type ReactNode } from "react";
import { ADMIN_SECRET_SLUG } from "@/config/adminConfig";

export default function ConditionalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin =
    pathname.startsWith("/admin") ||
    pathname.startsWith(`/${ADMIN_SECRET_SLUG}`);

  if (isAdmin) {
    // Admin routes: render children as-is — the admin layout handles its own shell
    return <>{children}</>;
  }

  // Storefront routes: wrap with Header + Footer + Toast
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <InventoryToast />
      <WishlistToast />
    </>
  );
}
