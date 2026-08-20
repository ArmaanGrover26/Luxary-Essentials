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
} from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { label: "Dashboard", href: "/admin",          icon: LayoutDashboard },
  { label: "Products",  href: "/admin/products", icon: Package },
  { label: "Orders",    href: "/admin/orders",   icon: ShoppingBag },
  { label: "Users",     href: "/admin/users",    icon: Users },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Login page — bare shell, no sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    window.location.href = "/admin/login";
  };

  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div style={{ padding: "1.5rem 1.25rem 1rem", borderBottom: "1px solid #ede5d8" }}>
        <Link href="/admin" style={{ textDecoration: "none" }} onClick={() => setMobileOpen(false)}>
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
          const isActive = item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);

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
      {/* ─── Desktop layout: flex row with sidebar ─── */}
      <div className="admin-shell">

        {/* Sidebar — desktop: always visible flex child */}
        <aside className="admin-sidebar-desktop">
          <SidebarContent />
        </aside>

        {/* Main area */}
        <div className="admin-content-area">

          {/* Mobile topbar */}
          <header className="admin-mobile-topbar">
            <Link href="/admin" style={{
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

      {/* ─── Mobile sidebar drawer ─── */}
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
        /* Shell: flex row for desktop sidebar + content */
        .admin-shell {
          display: flex;
          min-height: 100vh;
          background: #f5f0e8;
          font-family: 'Jost', sans-serif;
        }

        /* Desktop sidebar — always visible flex item */
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

        /* Content area next to sidebar */
        .admin-content-area {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        /* Mobile topbar — hidden on desktop */
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

        /* Page content padding */
        .admin-page-content {
          flex: 1;
          padding: 2rem;
          max-width: 1280px;
          width: 100%;
          margin: 0 auto;
          box-sizing: border-box;
        }

        /* Mobile sidebar drawer — hidden off-screen */
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
          /* Hidden on desktop */
          visibility: hidden;
        }

        @media (max-width: 768px) {
          /* Hide desktop sidebar */
          .admin-sidebar-desktop {
            display: none !important;
          }
          /* Show mobile topbar */
          .admin-mobile-topbar {
            display: flex !important;
          }
          /* Show mobile drawer */
          .admin-sidebar-mobile {
            visibility: visible;
          }
          /* Adjust page content padding */
          .admin-page-content {
            padding: 1.25rem !important;
          }
        }
      `}</style>
    </>
  );
}
