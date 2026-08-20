"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  User as UserIcon,
  Mail,
  Calendar,
  Filter,
} from "lucide-react";

interface UserItem {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // Filters
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [, startTransition] = useTransition();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      query.set("page", page.toString());
      query.set("limit", "10");
      if (search) query.set("search", search);
      if (roleFilter) query.set("role", roleFilter);

      const res = await fetch(`/api/admin/users?${query.toString()}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.data.users);
        setTotal(data.data.total);
        setPages(data.data.pages);
      }
    } catch (err) {
      console.error("Failed to load users", err);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Top Header */}
      <div style={{
        background: "#ffffff",
        padding: "1.5rem 1.75rem",
        borderRadius: "16px",
        border: "1px solid #ede5d8",
        boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
      }}>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "2rem",
          fontWeight: 500,
          color: "#2c2c2c",
          margin: 0,
          lineHeight: 1.2,
        }}>
          User Registry
        </h1>
        <p style={{
          fontFamily: "'Jost', sans-serif",
          fontSize: "0.875rem",
          color: "#6b6560",
          marginTop: "0.25rem",
          margin: 0,
        }}>
          Browse customer accounts, verify permissions, and review user registrations.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div style={{
        background: "#ffffff",
        padding: "1rem 1.25rem",
        borderRadius: "16px",
        border: "1px solid #ede5d8",
        boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
      }}>
        {/* Search Input */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: "rgba(250,247,242,0.8)",
          border: "1px solid #ede5d8",
          borderRadius: "12px",
          padding: "0.55rem 0.9rem",
          flex: "1 1 260px",
          maxWidth: "360px",
        }}>
          <Search size={17} style={{ color: "#6b6560", flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search by Name or Email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              startTransition(() => {
                setPage(1);
              });
            }}
            style={{
              border: "none",
              background: "transparent",
              outline: "none",
              fontSize: "0.85rem",
              color: "#2c2c2c",
              width: "100%",
            }}
          />
        </div>

        {/* Role Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Filter size={16} style={{ color: "#6b6560" }} />
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            style={{
              padding: "0.55rem 1rem",
              background: "rgba(250,247,242,0.8)",
              border: "1px solid #ede5d8",
              borderRadius: "12px",
              fontSize: "0.85rem",
              fontWeight: 500,
              color: "#2c2c2c",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="">All Roles</option>
            <option value="user">Customers (User)</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div style={{
        background: "#ffffff",
        borderRadius: "16px",
        border: "1px solid #ede5d8",
        overflow: "hidden",
        boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
      }}>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#6b6560", fontSize: "0.875rem" }}>
            Loading registered users...
          </div>
        ) : users.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ background: "#faf7f2", borderBottom: "1px solid #ede5d8", color: "#a09990", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  <th style={{ padding: "0.75rem 1.25rem" }}>User Profile</th>
                  <th style={{ padding: "0.75rem 1.25rem" }}>Email Address</th>
                  <th style={{ padding: "0.75rem 1.25rem" }}>Role</th>
                  <th style={{ padding: "0.75rem 1.25rem" }}>Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} style={{ borderBottom: "1px solid #ede5d8" }}>
                    <td style={{ padding: "0.9rem 1.25rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{
                          width: "38px", height: "38px", borderRadius: "50%",
                          background: "#f5f0e8", border: "1px solid rgba(184,157,114,0.4)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontFamily: "'Cormorant Garamond', serif", fontSize: "0.9rem",
                          fontWeight: 700, color: "#8b7355", flexShrink: 0,
                        }}>
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: "#2c2c2c" }}>
                            {user.name}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "#6b6560", fontFamily: "monospace" }}>
                            ID: #{user._id.slice(-6).toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: "0.9rem 1.25rem", color: "#2c2c2c" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Mail size={14} style={{ color: "#6b6560" }} />
                        <span>{user.email}</span>
                      </div>
                    </td>

                    <td style={{ padding: "0.9rem 1.25rem" }}>
                      {user.role === "admin" ? (
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: "4px",
                          padding: "0.25rem 0.65rem", borderRadius: "20px", fontSize: "0.72rem",
                          fontWeight: 600, background: "rgba(184,157,114,0.12)", color: "#8b7355",
                          border: "1px solid rgba(184,157,114,0.3)",
                        }}>
                          <ShieldCheck size={13} /> Admin
                        </span>
                      ) : (
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: "4px",
                          padding: "0.25rem 0.65rem", borderRadius: "20px", fontSize: "0.72rem",
                          fontWeight: 500, background: "#f3f4f6", color: "#374151",
                          border: "1px solid #e5e7eb",
                        }}>
                          <UserIcon size={13} /> Customer
                        </span>
                      )}
                    </td>

                    <td style={{ padding: "0.9rem 1.25rem", fontSize: "0.78rem", color: "#6b6560" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Calendar size={14} style={{ color: "#6b6560" }} />
                        <span>
                          {new Date(user.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: "3rem", textAlign: "center", color: "#6b6560", fontSize: "0.875rem" }}>
            No registered users found.
          </div>
        )}

        {/* Pagination Bar */}
        {pages > 1 && (
          <div style={{
            padding: "0.9rem 1.25rem", borderTop: "1px solid #ede5d8", background: "#faf7f2",
            display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.78rem", color: "#6b6560",
          }}>
            <div>
              Showing page <strong style={{ color: "#2c2c2c" }}>{page}</strong> of <strong style={{ color: "#2c2c2c" }}>{pages}</strong> ({total} users)
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                style={{
                  padding: "4px 8px", border: "1px solid #ede5d8", background: "#ffffff",
                  borderRadius: "6px", cursor: "pointer", opacity: page <= 1 ? 0.4 : 1,
                }}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={page >= pages}
                onClick={() => setPage((p) => p + 1)}
                style={{
                  padding: "4px 8px", border: "1px solid #ede5d8", background: "#ffffff",
                  borderRadius: "6px", cursor: "pointer", opacity: page >= pages ? 0.4 : 1,
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
