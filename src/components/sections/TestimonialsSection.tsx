"use client";

const testimonials = [
    {
        name: "Priya Sharma",
        location: "Mumbai",
        rating: 5,
        text: "Absolutely obsessed with my ocean resin tray! The craftsmanship is stunning — every guest asks about it. The packaging was equally luxurious.",
        product: "Ocean Resin Tray",
        initial: "P",
        accent: "#b89d72",
    },
    {
        name: "Neha Kapoor",
        location: "Bangalore",
        rating: 5,
        text: "The vanilla amber candle burns so cleanly and the scent is divine — not overpowering at all. Finally found a candle brand I can trust.",
        product: "Vanilla Amber Candle",
        initial: "N",
        accent: "#c4a882",
    },
    {
        name: "Ritika Jain",
        location: "Delhi",
        rating: 5,
        text: "I bought the epoxy resin kit as a beginner and it was perfect. The instructions inside were clear and the clarity of the resin is incredible.",
        product: "Epoxy Resin Kit",
        initial: "R",
        accent: "#8b7355",
    },
];

function Stars({ count }: { count: number }) {
    return (
        <div style={{ display: "flex", gap: "3px" }}>
            {[1, 2, 3, 4, 5].map((i) => (
                <svg
                    key={i}
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill={i <= count ? "var(--gold)" : "var(--beige)"}
                >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            ))}
        </div>
    );
}

export default function TestimonialsSection() {
    return (
        <section
            style={{
                background: "var(--cream)",
                padding: "7rem 2rem",
                borderTop: "1px solid var(--beige)",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Ambient */}
            <div
                style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%,-50%)",
                    width: "600px",
                    height: "600px",
                    background: "radial-gradient(ellipse, rgba(212,184,150,0.08) 0%, transparent 70%)",
                    pointerEvents: "none",
                }}
            />

            <div style={{ maxWidth: "1320px", margin: "0 auto", position: "relative" }}>
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: "4.5rem" }}>
                    <span className="section-label">Real Reviews</span>
                    <h2
                        className="section-title"
                        style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)" }}
                    >
                        Loved by Our Community
                    </h2>
                    <div
                        style={{
                            fontFamily: "'Jost', sans-serif",
                            fontSize: "0.85rem",
                            color: "var(--light-gray)",
                            marginTop: "1rem",
                            letterSpacing: "0.05em",
                        }}
                    >
                        2,000+ happy customers and counting
                    </div>
                    <hr className="gold-divider" style={{ width: "60px", margin: "1.25rem auto 0" }} />
                </div>

                {/* Cards */}
                <div className="testimonial-grid">
                    {testimonials.map((t, i) => (
                        <div
                            key={t.name}
                            className={`testimonial-card animate-fade-up delay-${(i + 1) * 100}`}
                        >
                            {/* Rating */}
                            <Stars count={t.rating} />

                            {/* Quote */}
                            <p
                                style={{
                                    fontFamily: "'Cormorant Garamond', serif",
                                    fontSize: "1.1rem",
                                    fontWeight: 400,
                                    color: "var(--charcoal)",
                                    lineHeight: 1.7,
                                    marginTop: "1.25rem",
                                    marginBottom: "2rem",
                                    fontStyle: "italic",
                                }}
                            >
                                &ldquo;{t.text}&rdquo;
                            </p>

                            {/* Divider */}
                            <hr className="gold-divider" style={{ marginBottom: "1.25rem" }} />

                            {/* Author + product */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                    <div
                                        style={{
                                            width: "40px",
                                            height: "40px",
                                            borderRadius: "50%",
                                            background: t.accent,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "white",
                                            fontFamily: "'Cormorant Garamond', serif",
                                            fontSize: "1rem",
                                            fontWeight: 400,
                                        }}
                                    >
                                        {t.initial}
                                    </div>
                                    <div>
                                        <div
                                            style={{
                                                fontFamily: "'Jost', sans-serif",
                                                fontSize: "0.82rem",
                                                fontWeight: 500,
                                                color: "var(--charcoal)",
                                            }}
                                        >
                                            {t.name}
                                        </div>
                                        <div
                                            style={{
                                                fontFamily: "'Jost', sans-serif",
                                                fontSize: "0.72rem",
                                                color: "var(--light-gray)",
                                                letterSpacing: "0.06em",
                                            }}
                                        >
                                            {t.location}
                                        </div>
                                    </div>
                                </div>
                                <div
                                    style={{
                                        fontFamily: "'Jost', sans-serif",
                                        fontSize: "0.68rem",
                                        color: "var(--gold)",
                                        letterSpacing: "0.08em",
                                        textAlign: "right",
                                    }}
                                >
                                    Bought:
                                    <br />
                                    <span style={{ color: "var(--warm-gray)", fontStyle: "italic" }}>
                                        {t.product}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Aggregate rating */}
                <div
                    style={{
                        textAlign: "center",
                        marginTop: "4rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "1.5rem",
                        flexWrap: "wrap",
                    }}
                >
                    <div>
                        <span
                            className="font-serif"
                            style={{ fontSize: "3.5rem", fontWeight: 300, color: "var(--charcoal)" }}
                        >
                            4.9
                        </span>
                        <span
                            style={{
                                fontFamily: "'Jost', sans-serif",
                                fontSize: "0.8rem",
                                color: "var(--light-gray)",
                                marginLeft: "0.5rem",
                                verticalAlign: "middle",
                            }}
                        >
                            / 5
                        </span>
                    </div>
                    <div>
                        <Stars count={5} />
                        <div
                            style={{
                                fontFamily: "'Jost', sans-serif",
                                fontSize: "0.75rem",
                                color: "var(--light-gray)",
                                marginTop: "0.5rem",
                                letterSpacing: "0.08em",
                            }}
                        >
                            Based on 2,100+ reviews
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .testimonial-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.75rem;
        }
        @media (max-width: 900px) {
          .testimonial-grid { grid-template-columns: 1fr; }
        }
      `}</style>
        </section>
    );
}
