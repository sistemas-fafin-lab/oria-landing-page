"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { OriaAssistant } from "../components/chat";
import {
  SkipLink,
  ShortcutsButton,
  ShortcutsOverlay,
  useKeydown,
  isTypingTarget,
  type ShortcutGroup,
} from "../components/keyboard";
import { useAccessibility } from "../components/accessibility";
import { useTheme } from "../components/theme";

/* Ordered landing sections for keyboard navigation (g/G, j/k, 1–4). */
const SECTIONS = ["top", "solucao", "como", "beneficios", "diferenciais"];

function scrollToId(id: string) {
  if (id === "top") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 40;
  window.scrollTo({ top, behavior: "smooth" });
}

function goSection(delta: number) {
  const tops = SECTIONS.map((id) => {
    const el = document.getElementById(id);
    return el ? el.getBoundingClientRect().top + window.scrollY : Infinity;
  });
  const mark = window.scrollY + window.innerHeight * 0.35;
  let idx = 0;
  for (let i = 0; i < tops.length; i++) if (tops[i] <= mark) idx = i;
  const next = Math.max(0, Math.min(SECTIONS.length - 1, idx + delta));
  scrollToId(SECTIONS[next]);
}

const SHORTCUTS: ShortcutGroup[] = [
  {
    heading: "Navegação",
    items: [
      { keys: ["1"], label: "O que é a ORIA" },
      { keys: ["2"], label: "Como funciona" },
      { keys: ["3"], label: "O que você recebe" },
      { keys: ["4"], label: "Diferenciais" },
      { keys: ["j"], label: "Próxima seção" },
      { keys: ["k"], label: "Seção anterior" },
      { keys: ["g"], label: "Ir para o topo" },
      { keys: ["G"], label: "Ir para o final" },
    ],
  },
  {
    heading: "Ações",
    items: [
      { keys: ["e"], label: "Enviar exame pelo WhatsApp" },
      { keys: ["a"], label: "Abrir assistente ORIA" },
      { keys: ["t"], label: "Alternar tema claro/escuro" },
      { keys: ["l"], label: "Entrar" },
      { keys: ["c"], label: "Criar conta" },
    ],
  },
  {
    heading: "Geral",
    items: [
      { keys: ["?"], label: "Mostrar/ocultar esta ajuda" },
      { keys: ["Esc"], label: "Fechar" },
    ],
  },
];

export default function Home() {
  const router = useRouter();
  const { isDark, toggle: toggleTheme } = useTheme();
  const theme = isDark ? "dark" : "light";
  const [chatOpen, setChatOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const { shortcutsEnabled } = useAccessibility();

  const openChat = () => setChatOpen(true);

  const handleSendExam = () => {
    window.open(
      "https://wa.me/5561998126025?text=Ol%C3%A1%2C%20Oria!",
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleLoginClick = () => {
    router.push("/login");
  };

  const handleSignupClick = () => {
    router.push("/signup");
  };

  useKeydown((e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === "Escape") {
      if (helpOpen) setHelpOpen(false);
      else if (chatOpen) setChatOpen(false);
      return;
    }
    if (!shortcutsEnabled) return;
    if (isTypingTarget(e.target)) return;
    switch (e.key) {
      case "?": e.preventDefault(); setHelpOpen((o) => !o); break;
      case "j": e.preventDefault(); goSection(1); break;
      case "k": e.preventDefault(); goSection(-1); break;
      case "g": e.preventDefault(); scrollToId("top"); break;
      case "G":
        e.preventDefault();
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
        break;
      case "1": e.preventDefault(); scrollToId("solucao"); break;
      case "2": e.preventDefault(); scrollToId("como"); break;
      case "3": e.preventDefault(); scrollToId("beneficios"); break;
      case "4": e.preventDefault(); scrollToId("diferenciais"); break;
      case "t": e.preventDefault(); toggleTheme(); break;
      case "e": e.preventDefault(); handleSendExam(); break;
      case "a": e.preventDefault(); openChat(); break;
      case "l": e.preventDefault(); handleLoginClick(); break;
      case "c": e.preventDefault(); handleSignupClick(); break;
    }
  });

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
      <SkipLink targetId="conteudo" />
      <Nav
        onSend={handleSendExam}
        theme={theme}
        toggleTheme={toggleTheme}
        onLoginClick={handleLoginClick}
        onSignupClick={handleSignupClick}
      />
      <main id="conteudo" tabIndex={-1} style={{ outline: "none" }}>
        <Hero onSend={handleSendExam} />
        <FilmSection />
        <Problem />
        <Solution />
        <HowItWorks />
        <Benefits />
        <IsIsNot />
        <FinalCTA onSend={handleSendExam} />
      </main>
      <Footer />

      {/* Floating ORIA assistant button */}
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
          aria-label="Abrir assistente ORIA"
          title="Assistente ORIA"
          className="oria-fab oria-float-cta"
        >
          <Icon name="message-circle" size={23} color="currentColor" />
        </button>
      </div>

      <OriaAssistant
        open={chatOpen}
        onClose={() => setChatOpen(false)}
      />

      <ShortcutsButton onClick={() => setHelpOpen((o) => !o)} />
      <ShortcutsOverlay
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        groups={SHORTCUTS}
      />
    </div>
  );
}
