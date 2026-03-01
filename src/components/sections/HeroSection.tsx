"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";

export default function HeroSection() {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const onMove = (e: MouseEvent) => {
            const rect = el.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            el.style.setProperty("--mx", `${x * 100}%`);
            el.style.setProperty("--my", `${y * 100}%`);
        };
        el.addEventListener("mousemove", onMove);
        return () => el.removeEventListener("mousemove", onMove);
    }, []);

    return (
        <section
            ref={ref}
            style={{
                position: "relative",
                minHeight: "92vh",
                display: "flex",
                alignItems: "center",
                overflow: "hidden",
                background: "var(--ivory)",
            }}
        >
            {/* Ambient background blobs */}
            <div
                style={{
                    position: "absolute",
                    top: "-10%",
                    right: "-5%",
                    width: "55%",
                    height: "110%",
                    background:
                        "radial-gradient(ellipse at center, var(--blush) 0%, var(--ivory) 70%)",
                    pointerEvents: "none",
                    zIndex: 0,
                }}
            />
            <div
                style={{
                    position: "absolute",
                    bottom: "-20%",
                    left: "5%",
                    width: "30%",
                    height: "60%",
                    background:
                        "radial-gradient(ellipse at center, rgba(212,184,150,0.18) 0%, transparent 70%)",
                    pointerEvents: "none",
                    zIndex: 0,
                }}
            />

            <div
                style={{
                    maxWidth: "1320px",
                    margin: "0 auto",
                    padding: "6rem 2rem",
                    width: "100%",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "5rem",
                    alignItems: "center",
                    position: "relative",
                    zIndex: 1,
                }}
                className="hero-grid"
            >
                {/* Text */}
                <div>
                    <div className="animate-fade-up">
                        <span className="section-label">New Collection 2026</span>
                    </div>
                    <h1
                        className="font-serif animate-fade-up delay-100"
                        style={{
                            fontSize: "clamp(3rem, 6vw, 5.5rem)",
                            fontWeight: 300,
                            lineHeight: 1.05,
                            color: "var(--charcoal)",
                            marginBottom: "1.5rem",
                        }}
                    >
                        Crafted
                        <br />
                        <em style={{ color: "var(--gold)", fontStyle: "italic" }}>with</em>
                        <br />
                        Elegance
                    </h1>
                    <p
                        className="animate-fade-up delay-200"
                        style={{
                            fontFamily: "'Jost', sans-serif",
                            fontSize: "0.95rem",
                            color: "var(--warm-gray)",
                            lineHeight: 1.85,
                            maxWidth: "380px",
                            marginBottom: "2.5rem",
                            fontWeight: 300,
                        }}
                    >
                        Discover handcrafted resin art, artisanal candles, and premium craft
                        supplies — designed for those who find beauty in the details.
                    </p>

                    <div
                        className="animate-fade-up delay-300"
                        style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}
                    >
                        <Link href="/shop" className="btn-gold">
                            Shop Collection
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </Link>
                        <Link href="/about" className="btn-outline">
                            Our Story
                        </Link>
                    </div>

                    {/* Stats */}
                    <div
                        className="animate-fade-up delay-400"
                        style={{
                            display: "flex",
                            gap: "3rem",
                            marginTop: "4rem",
                            paddingTop: "2rem",
                            borderTop: "1px solid var(--beige)",
                        }}
                    >
                        {[
                            { num: "2k+", label: "Happy Customers" },
                            { num: "150+", label: "Unique Products" },
                            { num: "4.9★", label: "Avg. Rating" },
                        ].map((s) => (
                            <div key={s.label}>
                                <div
                                    className="font-serif"
                                    style={{ fontSize: "1.75rem", fontWeight: 400, color: "var(--charcoal)" }}
                                >
                                    {s.num}
                                </div>
                                <div
                                    style={{
                                        fontFamily: "'Jost', sans-serif",
                                        fontSize: "0.72rem",
                                        color: "var(--light-gray)",
                                        letterSpacing: "0.1em",
                                        textTransform: "uppercase",
                                        marginTop: "4px",
                                    }}
                                >
                                    {s.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Hero image area */}
                <div
                    className="animate-scale-in delay-200"
                    style={{ position: "relative" }}
                >
                    {/* Main image */}
                    <div
                        style={{
                            borderRadius: "8px",
                            overflow: "hidden",
                            boxShadow: "0 32px 80px rgba(0,0,0,0.12)",
                            aspectRatio: "4/5",
                            background: "var(--beige)",
                            position: "relative",
                        }}
                    >
                        <div
                            style={{
                                width: "100%",
                                height: "100%",
                                background:
                                    "linear-gradient(135deg, var(--blush) 0%, var(--beige) 40%, var(--rose) 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexDirection: "column",
                                gap: "1rem",
                            }}
                        >
                            {/* Decorative resin art illustration */}
                            <div
                                className="animate-float"
                                style={{
                                    width: "200px",
                                    height: "200px",
                                    borderRadius: "50%",
                                    background:
                                        "radial-gradient(ellipse at 40% 35%, rgba(255,255,255,0.7), rgba(212,184,150,0.4) 50%, rgba(232,213,204,0.6))",
                                    boxShadow:
                                        "inset -8px -8px 24px rgba(139,115,85,0.2), 0 16px 48px rgba(184,157,114,0.25)",
                                    border: "1px solid rgba(255,255,255,0.6)",
                                }}
                            />
                            <div
                                style={{
                                    width: "120px",
                                    height: "60px",
                                    borderRadius: "30px",
                                    background:
                                        "linear-gradient(135deg, rgba(255,255,255,0.5), rgba(212,184,150,0.3))",
                                    boxShadow: "0 8px 24px rgba(184,157,114,0.2)",
                                    border: "1px solid rgba(255,255,255,0.5)",
                                }}
                            />
                        </div>

                        {/* Overlay label */}
                        <div
                            style={{
                                position: "absolute",
                                bottom: "1.5rem",
                                left: "1.5rem",
                                background: "rgba(255,255,255,0.85)",
                                backdropFilter: "blur(12px)",
                                borderRadius: "4px",
                                padding: "0.75rem 1.25rem",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                            }}
                        >
                            <div
                                style={{
                                    fontFamily: "'Cormorant Garamond', serif",
                                    fontSize: "0.9rem",
                                    color: "var(--charcoal)",
                                }}
                            >
                                Featured: Ocean Resin Tray
                            </div>
                            <div
                                style={{
                                    fontFamily: "'Jost', sans-serif",
                                    fontSize: "0.75rem",
                                    color: "var(--gold)",
                                    marginTop: "2px",
                                }}
                            >
                                ₹1,499 — Limited Edition
                            </div>
                        </div>
                    </div>

                    {/* Floating tag */}
                    <div
                        className="animate-slide-left delay-400"
                        style={{
                            position: "absolute",
                            top: "2rem",
                            right: "-2rem",
                            background: "var(--charcoal)",
                            color: "var(--gold-light)",
                            padding: "1rem 1.25rem",
                            borderRadius: "4px",
                            textAlign: "center",
                            boxShadow: "var(--shadow-card)",
                        }}
                    >
                        <div
                            className="font-serif"
                            style={{ fontSize: "1.5rem", fontWeight: 300 }}
                        >
                            New
                        </div>
                        <div
                            style={{
                                fontFamily: "'Jost', sans-serif",
                                fontSize: "0.6rem",
                                letterSpacing: "0.2em",
                                textTransform: "uppercase",
                                opacity: 0.7,
                            }}
                        >
                            Arrivals
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll hint */}
            <div
                style={{
                    position: "absolute",
                    bottom: "2rem",
                    left: "50%",
                    transform: "translateX(-50%)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.5rem",
                }}
            >
                <span
                    style={{
                        fontFamily: "'Jost', sans-serif",
                        fontSize: "0.65rem",
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        color: "var(--light-gray)",
                    }}
                >
                    Scroll
                </span>
                <div
                    style={{
                        width: "1px",
                        height: "40px",
                        background:
                            "linear-gradient(180deg, var(--gold), transparent)",
                        animation: "float 2s ease-in-out infinite",
                    }}
                />
            </div>

            <style jsx>{`
        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 5rem;
        }
        @media (max-width: 900px) {
          .hero-grid {
            grid-template-columns: 1fr;
            gap: 3rem;
            text-align: center;
          }
          .hero-grid > div:first-child p { margin: 0 auto 2rem; }
          .hero-grid > div:first-child > .animate-fade-up:nth-child(4) > div {
            justify-content: center;
          }
        }
      `}</style>
        </section>
    );
}
