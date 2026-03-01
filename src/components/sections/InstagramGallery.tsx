"use client";

const items = [
    { bg: "linear-gradient(135deg,#f0e4dc,#e8d5cc)", label: "Resin Geode Clock", rotate: "2deg" },
    { bg: "linear-gradient(135deg,#ede5d8,#d4b896)", label: "Gold Leaf Candle", rotate: "-1deg" },
    { bg: "linear-gradient(135deg,#e8d5cc,#f0e4dc)", label: "Ocean Tray ✨", rotate: "1.5deg" },
    { bg: "linear-gradient(135deg,#d4b896,#b89d72)", label: "Crystal Kit", rotate: "-2deg" },
    { bg: "linear-gradient(135deg,#faf7f2,#ede5d8)", label: "Rose Wax Melts", rotate: "1deg" },
    { bg: "linear-gradient(135deg,#f5f0e8,#f0e4dc)", label: "Amber Candle", rotate: "-1deg" },
];

export default function InstagramGallery() {
    return (
        <section
            style={{
                background: "var(--ivory)",
                padding: "7rem 2rem",
                borderTop: "1px solid var(--beige)",
            }}
        >
            <div style={{ maxWidth: "1320px", margin: "0 auto" }}>
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
                    <span className="section-label">@luxuryessentials.in</span>
                    <h2
                        className="section-title"
                        style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)" }}
                    >
                        Follow Our World
                    </h2>
                    <p
                        style={{
                            fontFamily: "'Jost', sans-serif",
                            fontSize: "0.85rem",
                            color: "var(--light-gray)",
                            marginTop: "0.75rem",
                            letterSpacing: "0.05em",
                        }}
                    >
                        Tag us with <strong style={{ color: "var(--gold)" }}>#LuxuryEssentials</strong> to be featured
                    </p>
                </div>

                {/* Gallery grid */}
                <div className="gallery-grid">
                    {items.map((item, i) => (
                        <div
                            key={i}
                            className={`gallery-item animate-scale-in delay-${(i + 1) * 100}`}
                            style={{ aspectRatio: "1", borderRadius: "6px" }}
                        >
                            {/* Placeholder art */}
                            <div
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    background: item.bg,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transition: "transform 0.6s ease",
                                }}
                                className="card-img"
                            >
                                <div
                                    style={{
                                        width: "60%",
                                        height: "60%",
                                        borderRadius: "50%",
                                        background: "rgba(255,255,255,0.35)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backdropFilter: "blur(4px)",
                                        border: "1px solid rgba(255,255,255,0.5)",
                                        transform: `rotate(${item.rotate})`,
                                        boxShadow: "0 8px 24px rgba(0,0,0,0.07)",
                                        flexDirection: "column",
                                        gap: "4px",
                                        padding: "1rem",
                                        textAlign: "center",
                                    }}
                                >
                                    <span
                                        style={{
                                            fontFamily: "'Cormorant Garamond', serif",
                                            fontSize: "clamp(0.65rem, 1.5vw, 0.8rem)",
                                            color: "var(--charcoal)",
                                            fontStyle: "italic",
                                        }}
                                    >
                                        {item.label}
                                    </span>
                                </div>
                            </div>

                            {/* Hover overlay */}
                            <div className="gallery-overlay">
                                <div
                                    style={{
                                        width: "44px",
                                        height: "44px",
                                        borderRadius: "50%",
                                        background: "rgba(255,255,255,0.9)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--charcoal)" strokeWidth="1.5">
                                        <rect x="2" y="2" width="20" height="20" rx="5" />
                                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div style={{ textAlign: "center", marginTop: "3rem" }}>
                    <a
                        href="https://instagram.com"
                        target="_blank"
                        rel="noreferrer"
                        className="btn-outline"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                            <rect x="2" y="2" width="20" height="20" rx="5" />
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                        </svg>
                        Follow on Instagram
                    </a>
                </div>
            </div>

            <style jsx>{`
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 0.75rem;
        }
        @media (max-width: 1024px) {
          .gallery-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 560px) {
          .gallery-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
        </section>
    );
}
