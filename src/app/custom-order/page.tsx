"use client";
import { useState } from "react";

const productTypes = [
  { id: "frame", label: "Resin Photo Frame", desc: "Choose size: 8\", 10\", or 12\"" },
  { id: "clock", label: "Resin Wall Clock", desc: "Custom colors, pattern & mechanism" },
  { id: "preservation", label: "Flower / Memory Preservation", desc: "Flowers, jewelry, letters, coins" },
  { id: "phone", label: "Resin Phone Cover", desc: "Custom design — all models" },
  { id: "candle", label: "Handmade Candle", desc: "Custom fragrance, color & size" },
];

const frameSizes = ["8 inch – ₹799", "10 inch – ₹999", "12 inch – ₹1,299"];

const colorOptions = [
  { name: "Ocean Blue", color: "#7ea8b4" },
  { name: "Rose Gold", color: "#c4a882" },
  { name: "Blush Pink", color: "#f0c4c4" },
  { name: "Midnight", color: "#2c2c2c" },
  { name: "Forest Green", color: "#9eb8a0" },
  { name: "Lavender", color: "#b4a8d4" },
  { name: "Champagne", color: "#e8d5cc" },
  { name: "Custom (describe below)", color: "#ccc" },
];

export default function CustomOrderPage() {
  const [type, setType] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <main style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--cream)", padding: "4rem 1.5rem" }}>
        <div style={{ textAlign: "center", maxWidth: "480px" }}>
          <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "var(--ivory)", border: "2px solid var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 2rem" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <h2 className="font-serif" style={{ fontSize: "2rem", fontWeight: 400, color: "var(--charcoal)", marginBottom: "1rem" }}>Order Received!</h2>
          <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.88rem", color: "var(--warm-gray)", lineHeight: 1.85, marginBottom: "2rem" }}>
            Thank you for your custom order. We{"'"}ll review your details and contact you within <strong>24–48 hours</strong> to confirm pricing and timeline.
          </p>
          <button onClick={() => { setDone(false); setType(""); setSize(""); setColor(""); }} className="btn-outline">Place Another Order</button>
        </div>
      </main>
    );
  }

  const step = type === "frame" ? 4 : 3;

  return (
    <main style={{ background: "var(--cream)", minHeight: "100vh" }}>
      <section style={{ background: "var(--charcoal)", padding: "5rem 1.5rem 4rem", textAlign: "center" }}>
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          <span className="section-label" style={{ color: "var(--gold)" }}>Made Just for You</span>
          <h1 className="font-serif" style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)", fontWeight: 300, color: "var(--ivory)", marginTop: "0.5rem", marginBottom: "1rem" }}>
            Place a Custom Order
          </h1>
          <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.9rem", color: "rgba(245,240,232,0.6)", lineHeight: 1.8 }}>
            Handcrafted to your vision. Custom orders ship within 7–10 working days.
          </p>
        </div>
      </section>

      <section style={{ padding: "5rem 1.5rem 7rem" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <form onSubmit={(e) => { e.preventDefault(); setDone(true); }} style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>

            {/* Step 1: Type */}
            <div style={{ background: "var(--white)", borderRadius: "10px", border: "1px solid var(--beige)", padding: "2rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Jost', sans-serif", fontSize: "0.75rem", fontWeight: 600, color: "white", flexShrink: 0 }}>1</div>
                <h2 className="font-serif" style={{ fontSize: "1.25rem", fontWeight: 400, color: "var(--charcoal)" }}>Choose Product Type</h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: "0.75rem" }}>
                {productTypes.map((pt) => (
                  <button key={pt.id} type="button" onClick={() => { setType(pt.id); setSize(""); }}
                    style={{ padding: "1rem 1.25rem", border: type === pt.id ? "2px solid var(--gold)" : "1px solid var(--beige)", borderRadius: "6px", background: type === pt.id ? "var(--ivory)" : "var(--cream)", cursor: "pointer", textAlign: "left", transition: "all 0.25s" }}>
                    <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.82rem", fontWeight: 500, color: "var(--charcoal)", marginBottom: "0.2rem" }}>{pt.label}</div>
                    <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.7rem", color: "var(--light-gray)" }}>{pt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Size (frames only) */}
            {type === "frame" && (
              <div style={{ background: "var(--white)", borderRadius: "10px", border: "1px solid var(--beige)", padding: "2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Jost', sans-serif", fontSize: "0.75rem", fontWeight: 600, color: "white", flexShrink: 0 }}>2</div>
                  <h2 className="font-serif" style={{ fontSize: "1.25rem", fontWeight: 400, color: "var(--charcoal)" }}>Select Frame Size</h2>
                </div>
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  {frameSizes.map((sz) => (
                    <button key={sz} type="button" onClick={() => setSize(sz)}
                      style={{ padding: "0.875rem 1.5rem", border: size === sz ? "2px solid var(--gold)" : "1px solid var(--beige)", borderRadius: "6px", background: size === sz ? "var(--ivory)" : "var(--cream)", cursor: "pointer", fontFamily: "'Jost', sans-serif", fontSize: "0.82rem", color: "var(--charcoal)", transition: "all 0.25s" }}>
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Color */}
            {type && (
              <div style={{ background: "var(--white)", borderRadius: "10px", border: "1px solid var(--beige)", padding: "2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Jost', sans-serif", fontSize: "0.75rem", fontWeight: 600, color: "white", flexShrink: 0 }}>
                    {type === "frame" ? "3" : "2"}
                  </div>
                  <h2 className="font-serif" style={{ fontSize: "1.25rem", fontWeight: 400, color: "var(--charcoal)" }}>Color Palette</h2>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "0.625rem" }}>
                  {colorOptions.map((c) => (
                    <button key={c.name} type="button" onClick={() => setColor(c.name)}
                      style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.75rem", border: color === c.name ? "2px solid var(--gold)" : "1px solid var(--beige)", borderRadius: "6px", background: color === c.name ? "var(--ivory)" : "var(--cream)", cursor: "pointer", transition: "all 0.25s" }}>
                      <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: c.color, flexShrink: 0, border: "1px solid rgba(0,0,0,0.08)" }} />
                      <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.7rem", color: "var(--charcoal)", textAlign: "left" }}>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Details */}
            {type && (
              <div style={{ background: "var(--white)", borderRadius: "10px", border: "1px solid var(--beige)", padding: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Jost', sans-serif", fontSize: "0.75rem", fontWeight: 600, color: "white", flexShrink: 0 }}>{step}</div>
                  <h2 className="font-serif" style={{ fontSize: "1.25rem", fontWeight: 400, color: "var(--charcoal)" }}>Your Details</h2>
                </div>
                <div className="form-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <input required type="text" placeholder="Your Name" style={{ padding: "0.875rem 1rem", border: "1px solid var(--beige)", borderRadius: "4px", fontFamily: "'Jost', sans-serif", fontSize: "0.85rem", background: "var(--cream)", outline: "none" }} />
                  <input required type="tel" placeholder="Phone / WhatsApp" style={{ padding: "0.875rem 1rem", border: "1px solid var(--beige)", borderRadius: "4px", fontFamily: "'Jost', sans-serif", fontSize: "0.85rem", background: "var(--cream)", outline: "none" }} />
                </div>
                <input type="email" placeholder="Email (optional)" style={{ padding: "0.875rem 1rem", border: "1px solid var(--beige)", borderRadius: "4px", fontFamily: "'Jost', sans-serif", fontSize: "0.85rem", background: "var(--cream)", outline: "none" }} />
                <textarea required rows={5} placeholder="Describe your customization — colors, inclusions, references, special requirements..." style={{ padding: "0.875rem 1rem", border: "1px solid var(--beige)", borderRadius: "4px", fontFamily: "'Jost', sans-serif", fontSize: "0.85rem", background: "var(--cream)", outline: "none", resize: "vertical" }} />
                <div>
                  <label style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.78rem", color: "var(--warm-gray)", display: "block", marginBottom: "0.4rem" }}>Reference Image (optional — JPEG/PNG)</label>
                  <input type="file" accept="image/*" />
                </div>
              </div>
            )}

            {type && (
              <button type="submit" className="btn-gold" style={{ width: "100%", justifyContent: "center", fontSize: "0.85rem", padding: "1.1rem" }}>
                Submit Custom Order Request
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
            )}
          </form>
          <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.76rem", color: "var(--light-gray)", textAlign: "center", marginTop: "1.25rem" }}>
            We&apos;ll reply within 24–48 hours to confirm pricing & timeline.
          </p>
        </div>
      </section>
    </main>
  );
}
