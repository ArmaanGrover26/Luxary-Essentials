import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us – Luxury Essentials",
  description: "Learn about Luxury Essentials — our story, our passion for resin art and candle making, and why we started crafting premium raw materials and custom resin products.",
};

const values = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.4">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    title: "Made with Love",
    desc: "Every product — from a resin kit to a custom clock — is prepared with genuine care and attention to detail.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.4">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "Quality First",
    desc: "We source only premium-grade materials — crystal-clear resins, pure soy wax, and non-toxic pigments.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.4">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
    title: "Fast & Reliable",
    desc: "We deliver within 3–5 business days, and custom orders are dispatched within 7–10 working days.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.4">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Customer First",
    desc: "2,000+ happy customers and counting. We're always here to help — before, during and after your order.",
  },
];

const offerings = [
  {
    label: "Primary Business",
    title: "Raw Craft Materials",
    desc: "We curate and supply premium raw materials for resin artists and candle makers across India. Whether you're a beginner picking up your first resin kit or an experienced crafter stocking your studio — we have you covered.",
    items: ["Epoxy resin kits (500g – 5kg)", "Pigment dyes & alcohol inks", "Silicone molds (geode, tray, jewelry)", "Mixing tools, gloves & measuring cups", "Soy & paraffin candle wax", "Fragrance oils, wicks & dye chips", "Candle molds & pouring pitchers"],
    color: "var(--ivory)",
    accent: "#7ea8b4",
    cta: "Shop Raw Materials",
    href: "/shop?cat=resin",
  },
  {
    label: "Secondary Business",
    title: "Custom Resin Creations",
    desc: "We design and handcraft bespoke resin products to your exact vision. From preserving your wedding flowers in resin to creating a personalized wall clock — each piece is unique and made with love.",
    items: ["Photo frames (8\", 10\", 12\")", "Resin wall clocks", "Flower & memory preservation", "Custom phone covers", "Handmade pillar candles"],
    color: "#f9f5f0",
    accent: "#b89d72",
    cta: "Place Custom Order",
    href: "/custom-order",
  },
];

export default function AboutPage() {
  return (
    <main>
      {/* Hero */}
      <section style={{ background: "var(--charcoal)", padding: "7rem 1.5rem 6rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-20%", left: "-10%", width: "50%", height: "140%", background: "radial-gradient(ellipse, rgba(184,157,114,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-20%", right: "-5%", width: "40%", height: "100%", background: "radial-gradient(ellipse, rgba(126,168,180,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: "720px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <span className="section-label" style={{ color: "var(--gold)" }}>Our Story</span>
          <h1 className="font-serif" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", fontWeight: 300, color: "var(--ivory)", lineHeight: 1.1, marginTop: "0.75rem", marginBottom: "1.5rem" }}>
            Crafted with<br /><span style={{ color: "var(--gold)", fontStyle: "italic" }}>Elegance</span>
          </h1>
          <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "1rem", color: "rgba(245,240,232,0.65)", lineHeight: 1.85, maxWidth: "560px", margin: "0 auto 2.5rem" }}>
            Luxury Essentials was born out of a love for handcrafted art and the belief that everyone deserves access to quality craft supplies and beautiful custom pieces.
          </p>
          <hr className="gold-divider" style={{ width: "60px", margin: "0 auto" }} />
        </div>
      </section>

      {/* Our Story */}
      <section style={{ background: "var(--cream)", padding: "6rem 1.5rem" }}>
        <div style={{ maxWidth: "1320px", margin: "0 auto" }} className="about-story-grid">
          {/* Text */}
          <div>
            <span className="section-label">Who We Are</span>
            <h2 className="font-serif section-title" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", marginBottom: "1.5rem" }}>A Small Brand with a Big Heart</h2>
            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.92rem", color: "var(--warm-gray)", lineHeight: 1.95, marginBottom: "1.25rem" }}>
              Luxury Essentials started as a passion project by a resin art enthusiast who couldn't find high-quality, affordable craft supplies in India. What began in a small studio has grown into a brand trusted by over 2,000 customers — from hobbyists to professional artists.
            </p>
            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.92rem", color: "var(--warm-gray)", lineHeight: 1.95, marginBottom: "2rem" }}>
              We believe that art should be accessible. That's why we carefully source the finest raw materials — premium epoxy resins, natural soy wax, vibrant pigments — and make them available at honest prices. Alongside our supplies, we offer a range of beautiful custom resin products, each handcrafted to order.
            </p>
            <div style={{ display: "flex", gap: "2.5rem", flexWrap: "wrap" }}>
              {[{ num: "2,000+", label: "Happy Customers" }, { num: "150+", label: "Products" }, { num: "4.9★", label: "Avg. Rating" }].map((s) => (
                <div key={s.label}>
                  <div className="font-serif" style={{ fontSize: "2rem", fontWeight: 400, color: "var(--charcoal)" }}>{s.num}</div>
                  <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.72rem", color: "var(--light-gray)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: "4px" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {[
              { bg: "linear-gradient(135deg,#f0e4dc,#e8d5cc)", label: "Resin Art in Progress", h: "240px" },
              { bg: "linear-gradient(135deg,#e8d5cc,#7ea8b488)", label: "Custom Frame Collection", h: "200px" },
            ].map((card) => (
              <div key={card.label} style={{ background: card.bg, borderRadius: "8px", height: card.h, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
                <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "rgba(255,255,255,0.5)", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.6)" }} />
                <div style={{ position: "absolute", bottom: "1rem", left: "1rem", fontFamily: "'Jost', sans-serif", fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--charcoal)", opacity: 0.7 }}>{card.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section style={{ background: "var(--ivory)", padding: "6rem 1.5rem" }}>
        <div style={{ maxWidth: "1320px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <span className="section-label">What We Do</span>
            <h2 className="font-serif section-title" style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>Two Things We Do Best</h2>
            <hr className="gold-divider" style={{ width: "60px", margin: "1.5rem auto 0" }} />
          </div>
          <div className="about-offer-grid">
            {offerings.map((o) => (
              <div key={o.title} style={{ background: o.color, borderRadius: "10px", padding: "2.5rem", border: "1px solid var(--beige)" }}>
                <div style={{ display: "inline-block", padding: "0.3rem 0.875rem", background: `${o.accent}22`, border: `1px solid ${o.accent}44`, borderRadius: "2px", fontFamily: "'Jost', sans-serif", fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", color: o.accent, marginBottom: "1.25rem" }}>{o.label}</div>
                <h3 className="font-serif" style={{ fontSize: "1.75rem", fontWeight: 400, color: "var(--charcoal)", marginBottom: "1rem" }}>{o.title}</h3>
                <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.88rem", color: "var(--warm-gray)", lineHeight: 1.85, marginBottom: "1.5rem" }}>{o.desc}</p>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "2rem" }}>
                  {o.items.map((item) => (
                    <li key={item} style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.83rem", color: "var(--charcoal)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ color: o.accent, fontSize: "1rem" }}>✦</span> {item}
                    </li>
                  ))}
                </ul>
                <Link href={o.href} className="btn-gold" style={{ display: "inline-flex" }}>{o.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section style={{ background: "var(--white)", padding: "6rem 1.5rem" }}>
        <div style={{ maxWidth: "1320px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <span className="section-label">Our Values</span>
            <h2 className="font-serif section-title" style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>Why Customers Love Us</h2>
            <hr className="gold-divider" style={{ width: "60px", margin: "1.5rem auto 0" }} />
          </div>
          <div className="trust-grid">
            {values.map((v) => (
              <div key={v.title} style={{ textAlign: "center", padding: "2rem 1.5rem" }}>
                <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "var(--ivory)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>{v.icon}</div>
                <h3 className="font-serif" style={{ fontSize: "1.2rem", fontWeight: 400, color: "var(--charcoal)", marginBottom: "0.75rem" }}>{v.title}</h3>
                <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.83rem", color: "var(--warm-gray)", lineHeight: 1.75 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "var(--gold-dark)", padding: "5rem 1.5rem", textAlign: "center" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h2 className="font-serif" style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 300, color: "var(--white)", marginBottom: "1rem" }}>Ready to Start Creating?</h2>
          <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.88rem", color: "rgba(255,255,255,0.7)", marginBottom: "2.5rem", lineHeight: 1.8 }}>Browse our full collection of craft supplies or place a custom order today.</p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/shop" className="btn-gold" style={{ background: "white", color: "var(--charcoal)" }}>Shop Now</Link>
            <Link href="/custom-order" className="btn-outline" style={{ borderColor: "rgba(255,255,255,0.4)", color: "white" }}>Custom Order</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
