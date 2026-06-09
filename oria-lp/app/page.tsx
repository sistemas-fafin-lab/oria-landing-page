"use client";

import { useState } from "react";
import { Icon } from "../components/parts";
import {
  Nav,
  Hero,
  FilmSection,
  Problem,
  Solution,
  HowItWorks,
  Benefits,
  IsIsNot,
  FinalCTA,
  Footer,
} from "../components/sections";
import { WhatsAppModal } from "../components/chat";

export default function Home() {
  const [theme, setTheme] = useState("dark");
  const [chatOpen, setChatOpen] = useState(false);

  const toggleTheme = () =>
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  const openChat = () => setChatOpen(true);

  return (
    <div
      className={theme === "dark" ? "dark" : ""}
      style={{
        background: "var(--bg-base)",
        color: "var(--text-primary)",
        minHeight: "100vh",
        transition:
          "background var(--dur-base) var(--ease-apple)",
      }}
    >
      <Nav
        onSend={openChat}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      <main>
        <Hero onSend={openChat} />
        <FilmSection />
        <Problem />
        <Solution />
        <HowItWorks />
        <Benefits />
        <IsIsNot />
        <FinalCTA onSend={openChat} />
      </main>
      <Footer />

      {/* Floating WhatsApp button */}
      <div
        className="oria-cta-in"
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 60,
        }}
      >
        <button
          onClick={openChat}
          aria-label="Abrir WhatsApp"
          className="oria-float-cta"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            background: "var(--oria-primary)",
            color: "#f4f2ee",
            border: "none",
            borderRadius: 999,
            padding: "14px 22px",
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            fontSize: 15,
            cursor: "pointer",
            boxShadow:
              "0 16px 40px rgba(14,90,67,0.34)",
          }}
        >
          <Icon
            name="message-circle"
            size={20}
            color="#f4f2ee"
          />
          WhatsApp
        </button>
      </div>

      <WhatsAppModal
        open={chatOpen}
        onClose={() => setChatOpen(false)}
      />
    </div>
  );
}
