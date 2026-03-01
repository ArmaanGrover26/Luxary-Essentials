"use client";

const features = [
    {
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.4">
                <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
        ),
        title: "Free Shipping",
        desc: "On all orders above ₹999",
    },
    {
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.4">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
        ),
        title: "100% Authentic",
        desc: "Handcrafted & quality-certified",
    },
    {
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.4">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
            </svg>
        ),
        title: "Easy Returns",
        desc: "7-day hassle-free returns",
    },
    {
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.4">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
            </svg>
        ),
        title: "Fast Delivery",
        desc: "Delivered within 3–5 business days",
    },
];

export default function TrustBanner() {
    return (
        <section
            style={{
                background: "var(--white)",
                borderTop: "1px solid var(--beige)",
                borderBottom: "1px solid var(--beige)",
                padding: "2.5rem 2rem",
            }}
        >
            <div
                style={{
                    maxWidth: "1320px",
                    margin: "0 auto",
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "1.5rem",
                }}
                className="trust-grid"
            >
                {features.map((f, i) => (
                    <div
                        key={f.title}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                            padding: "0.5rem 1rem",
                            borderRight: i < features.length - 1 ? "1px solid var(--beige)" : "none",
                        }}
                        className="trust-item"
                    >
                        <div
                            style={{
                                width: "48px",
                                height: "48px",
                                borderRadius: "50%",
                                background: "var(--ivory)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                            }}
                        >
                            {f.icon}
                        </div>
                        <div>
                            <div
                                style={{
                                    fontFamily: "'Jost', sans-serif",
                                    fontSize: "0.82rem",
                                    fontWeight: 500,
                                    color: "var(--charcoal)",
                                    letterSpacing: "0.04em",
                                }}
                            >
                                {f.title}
                            </div>
                            <div
                                style={{
                                    fontFamily: "'Jost', sans-serif",
                                    fontSize: "0.75rem",
                                    color: "var(--light-gray)",
                                    marginTop: "2px",
                                }}
                            >
                                {f.desc}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <style jsx>{`
        .trust-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }
        @media (max-width: 900px) {
          .trust-grid { grid-template-columns: repeat(2, 1fr); }
          .trust-item { border-right: none !important; border-bottom: 1px solid var(--beige); }
        }
        @media (max-width: 480px) {
          .trust-grid { grid-template-columns: 1fr; }
        }
      `}</style>
        </section>
    );
}
