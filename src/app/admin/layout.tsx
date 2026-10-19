"use client";

import { useState, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Store,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { ADMIN_SECRET_SLUG, getAdminUrl } from "@/config/adminConfig";

interface AdminLayoutProps {
  children: ReactNode;
}

const secretRoot = `/${ADMIN_SECRET_SLUG}`;

const navItems = [
  { label: "Dashboard",         href: secretRoot,                  icon: LayoutDashboard },
  { label: "Products",          href: `${secretRoot}/products`,     icon: Package },
  { label: "Festival Specials", href: `${secretRoot}/festivals`,    icon: Sparkles },
  { label: "Orders",            href: `${secretRoot}/orders`,       icon: ShoppingBag },
  { label: "Users",             href: `${secretRoot}/users`,        icon: Users },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Login page — bare shell, no sidebar
  if (pathname === "/admin/login" || pathname === `${secretRoot}/login`) {
    return <>{children}</>;
  }

  const handleLogout = () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    window.location.href = getAdminUrl("/login");
  };

  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div style={{ padding: "1.5rem 1.25rem 1rem", borderBottom: "1px solid #ede5d8" }}>
        <Link href={secretRoot} style={{ textDecoration: "none" }} onClick={() => setMobileOpen(false)}>
          <div style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "1.5rem",
            fontWeight: 400,
            color: "#2c2c2c",
            letterSpacing: "0.02em",
          }}>
            Luxury
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: "5px",
            marginTop: "3px",
            fontSize: "0.6rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#b89d72",
            fontWeight: 600,
          }}>
            <ShieldCheck size={11} />
            Admin Portal
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ padding: "1rem 0.75rem", flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
        <div style={{
          padding: "0.35rem 0.65rem",
          fontSize: "0.6rem",
          fontWeight: 700,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "#a09990",
          marginBottom: "4px",
        }}>
          Management
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === secretRoot
            ? pathname === secretRoot || pathname === "/admin"
            : pathname.startsWith(item.href) || pathname.startsWith(item.href.replace(secretRoot, "/admin"));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.65rem 0.9rem",
                borderRadius: "10px",
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "#8b7355" : "#6b6560",
                background: isActive ? "#faf7f2" : "transparent",
                border: `1px solid ${isActive ? "rgba(184,157,114,0.25)" : "transparent"}`,
                transition: "all 0.18s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Icon size={17} style={{ color: isActive ? "#b89d72" : "currentColor" }} />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight size={13} style={{ color: "#b89d72" }} />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: "0.75rem", borderTop: "1px solid #ede5d8" }}>
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "0.65rem 0.9rem",
            borderRadius: "10px",
            textDecoration: "none",
            fontSize: "0.82rem",
            color: "#6b6560",
            marginBottom: "2px",
          }}
        >
          <Store size={17} />
          <span>View Storefront</span>
        </Link>

        <button
          onClick={handleLogout}
          style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "0.65rem 0.9rem",
            borderRadius: "10px",
            border: "none",
            background: "transparent",
            fontSize: "0.82rem",
            color: "#dc2626",
            cursor: "pointer",
            width: "100%",
            textAlign: "left",
          }}
        >
          <LogOut size={17} />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop layout: flex row with sidebar */}
      <div className="admin-shell">

        {/* Sidebar — desktop: always visible flex child */}
        <aside className="admin-sidebar-desktop">
          <SidebarContent />
        </aside>

        {/* Main area */}
        <div className="admin-content-area">

          {/* Mobile topbar */}
          <header className="admin-mobile-topbar">
            <Link href={secretRoot} style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.4rem",
              color: "#2c2c2c",
              textDecoration: "none",
            }}>
              Luxury <span style={{ color: "#b89d72", fontStyle: "italic" }}>Admin</span>
            </Link>
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              style={{
                background: "none",
                border: "1px solid #ede5d8",
                borderRadius: "8px",
                padding: "6px 8px",
                cursor: "pointer",
                color: "#2c2c2c",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Menu size={20} />
            </button>
          </header>

          {/* Page content */}
          <main className="admin-page-content">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 99,
          }}
        />
      )}
      <div
        className="admin-sidebar-mobile"
        style={{ transform: mobileOpen ? "translateX(0)" : "translateX(-100%)" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "1rem" }}>
          <button
            onClick={() => setMobileOpen(false)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#6b6560" }}
          >
            <X size={22} />
          </button>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <SidebarContent />
        </div>
      </div>

      <style>{`
        .admin-shell {
          display: flex;
          min-height: 100vh;
          background: #f5f0e8;
          font-family: 'Jost', sans-serif;
        }

        .admin-sidebar-desktop {
          width: 240px;
          flex-shrink: 0;
          background: #ffffff;
          border-right: 1px solid #ede5d8;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
        }

        .admin-content-area {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        .admin-mobile-topbar {
          display: none;
          align-items: center;
          justify-content: space-between;
          padding: 0.8rem 1.25rem;
          background: rgba(255,255,255,0.95);
          border-bottom: 1px solid #ede5d8;
          position: sticky;
          top: 0;
          z-index: 30;
        }

        .admin-page-content {
          flex: 1;
          padding: 2rem;
          max-width: 1280px;
          width: 100%;
          margin: 0 auto;
          box-sizing: border-box;
        }

        .admin-sidebar-mobile {
          position: fixed;
          top: 0; left: 0;
          width: 260px;
          height: 100vh;
          background: #ffffff;
          border-right: 1px solid #ede5d8;
          display: flex;
          flex-direction: column;
          z-index: 100;
          transition: transform 0.3s ease;
          overflow-y: auto;
          visibility: hidden;
        }

        @media (max-width: 768px) {
          .admin-sidebar-desktop {
            display: none !important;
          }
          .admin-mobile-topbar {
            display: flex !important;
          }
          .admin-sidebar-mobile {
            visibility: visible;
          }
          .admin-page-content {
            padding: 1.25rem !important;
          }
        }
      `}</style>
    </>
  );
}
