import { useState, useRef, useEffect } from "react";

const AGENTS = [
  {
    id: "director", name: "Alexandre", role: "Directeur & Chef de projet", emoji: "🎯",
    color: "#C8A96E", accent: "#8B6914",
    system: "Tu es Alexandre, Directeur et Chef de projet d'une petite entreprise/freelance. Tu es stratégique, décisif et visionnaire. Tu aides à planifier des projets, définir des objectifs SMART, prioriser les tâches, analyser les risques et prendre des décisions stratégiques. Réponds toujours en français, de façon structurée et actionnable.",
    greeting: "Bonjour ! Je suis Alexandre, votre Directeur. Comment puis-je orienter votre entreprise aujourd'hui ?",
    placeholder: "Ex: J'ai 3 projets en cours, comment les prioriser ?",
  },
  {
    id: "secretary", name: "Sophie", role: "Secrétaire & Planificatrice", emoji: "📅",
    color: "#7EB8D4", accent: "#2E6E8E",
    system: "Tu es Sophie, Secrétaire et Planificatrice d'une petite entreprise/freelance. Tu es organisée, précise et proactive. Tu gères les agendas, rédiges des emails professionnels, crées des plannings et to-do lists. Réponds toujours en français, de façon claire et structurée.",
    greeting: "Bonjour ! Je suis Sophie, votre Secrétaire. Que puis-je organiser ou rédiger pour vous ?",
    placeholder: "Ex: Rédige un email de relance client professionnel",
  },
  {
    id: "hr", name: "Marc", role: "Responsable RH", emoji: "👥",
    color: "#9BB87E", accent: "#4A7A2E",
    system: "Tu es Marc, Responsable RH et Recrutement d'une petite entreprise/freelance. Tu es empathique, juste et méthodique. Tu gères les recrutements, rédiges des offres d'emploi et conseilles sur la gestion des talents. Réponds toujours en français, de façon humaine et professionnelle.",
    greeting: "Bonjour ! Je suis Marc, votre RH. Comment puis-je vous aider avec vos ressources humaines ?",
    placeholder: "Ex: Rédige une offre d'emploi pour un développeur junior",
  },
  {
    id: "accountant", name: "Isabelle", role: "Comptable & Finances", emoji: "💰",
    color: "#D4A574", accent: "#8B5E2E",
    system: "Tu es Isabelle, Comptable et Responsable Finances d'une petite entreprise/freelance. Tu es rigoureuse, analytique et fiable. Tu aides à créer des devis et factures, analyser la rentabilité, gérer la trésorerie et conseiller sur la fiscalité freelance. Réponds toujours en français, avec des chiffres précis.",
    greeting: "Bonjour ! Je suis Isabelle, votre Comptable. Comment puis-je vous aider avec vos finances ?",
    placeholder: "Ex: Aide-moi à calculer mon tarif journalier freelance",
  },
  {
    id: "marketing", name: "Léa", role: "Marketing & Communication", emoji: "📣",
    color: "#C47EB8", accent: "#7E2E8B",
    system: "Tu es Léa, Responsable Marketing et Communication d'une petite entreprise/freelance. Tu es créative, persuasive et orientée résultats. Tu crées des stratégies marketing, rédiges des posts réseaux sociaux et crées des pitchs clients. Réponds toujours en français, avec créativité et exemples concrets.",
    greeting: "Bonjour ! Je suis Léa, votre Marketing. Comment faire rayonner votre entreprise ?",
    placeholder: "Ex: Crée 5 posts LinkedIn pour promouvoir mes services",
  },
];

async function askAgent(systemPrompt, messages) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system: systemPrompt, messages }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || `Erreur ${res.status}`);
  return json.reply;
}

export default function App() {
  const [agentId, setAgentId] = useState("director");
  const [showPicker, setShowPicker] = useState(false);
  const [convos, setConvos] = useState(Object.fromEntries(AGENTS.map(a => [a.id, []])));
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const taRef = useRef(null);

  const agent = AGENTS.find(a => a.id === agentId);
  const msgs = convos[agentId];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [convos, agentId, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setError("");
    if (taRef.current) taRef.current.style.height = "46px";
    const newMsgs = [...msgs, { role: "user", content: text }];
    setConvos(p => ({ ...p, [agentId]: newMsgs }));
    setLoading(true);
    try {
      const reply = await askAgent(agent.system, newMsgs);
      setConvos(p => ({ ...p, [agentId]: [...newMsgs, { role: "assistant", content: reply }] }));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => setConvos(p => ({ ...p, [agentId]: [] }));
  const countMsgs = id => convos[id].filter(m => m.role === "user").length;

  return (
    <div style={{ background: "#0F0E0C", height: "100dvh", display: "flex", flexDirection: "column", fontFamily: "Georgia, serif", color: "#E8E0D0", overflow: "hidden" }}>

      <div style={{ background: "#141210", borderBottom: "1px solid #222", padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <button onClick={() => setShowPicker(p => !p)} style={{ width: 42, height: 42, borderRadius: "50%", border: "none", background: `linear-gradient(135deg, ${agent.color}, ${agent.accent})`, fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{agent.emoji}</button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: "bold", fontSize: 15, color: agent.color }}>{agent.name}</div>
          <div style={{ fontSize: 11, color: "#5a5040", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{agent.role}</div>
        </div>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4caf50", display: "inline-block", boxShadow: "0 0 6px #4caf50", marginRight: 4 }} />
        <button onClick={reset} style={{ background: "transparent", border: "1px solid #333", color: "#666", padding: "4px 10px", borderRadius: 8, cursor: "pointer", fontSize: 12 }}>↺</button>
      </div>

      {showPicker && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99, background: "rgba(0,0,0,0.8)" }} onClick={() => setShowPicker(false)}>
          <div onClick={e => e.stopPropagation()} style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "#141210", borderRadius: "18px 18px 0 0", borderTop: "1px solid #222", padding: "16px 0 40px" }}>
            <div style={{ width: 32, height: 3, background: "#333", borderRadius: 2, margin: "0 auto 16px" }} />
            <p style={{ padding: "0 16px 10px", fontSize: 10, color: "#444", letterSpacing: "0.12em", textTransform: "uppercase", margin: 0 }}>Votre équipe IA</p>
            {AGENTS.map(a => (
              <button key={a.id} onClick={() => { setAgentId(a.id); setShowPicker(false); }} style={{ width: "100%", background: agentId === a.id ? `${a.color}15` : "transparent", border: "none", borderLeft: agentId === a.id ? `3px solid ${a.color}` : "3px solid transparent", padding: "12px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, textAlign: "left" }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg, ${a.color}, ${a.accent})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 21, flexShrink: 0 }}>{a.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "bold", fontSize: 14, color: agentId === a.id ? a.color : "#c0b0a0" }}>{a.name}</div>
                  <div style={{ fontSize: 11, color: "#5a5040" }}>{a.role}</div>
                </div>
                {countMsgs(a.id) > 0 && <div style={{ background: a.color, color: "#111", borderRadius: "50%", width: 20, height: 20, fontSize: 10, fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center" }}>{countMsgs(a.id)}</div>}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflowY: "auto", padding: "14px 12px", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg, ${agent.color}, ${agent.accent})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{agent.emoji}</div>
          <div style={{ maxWidth: "80%", padding: "10px 14px", fontSize: 14, lineHeight: 1.65, color: "#d8d0c0", whiteSpace: "pre-wrap", wordBreak: "break-word", borderRadius: "18px 18px 18px 4px", background: "#1c1b18", border: "1px solid #252320" }}>{agent.greeting}</div>
        </div>

        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 8 }}>
            {m.role === "assistant" && <div style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg, ${agent.color}, ${agent.accent})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{agent.emoji}</div>}
            <div style={{ maxWidth: "80%", padding: "10px 14px", fontSize: 14, lineHeight: 1.65, color: "#d8d0c0", whiteSpace: "pre-wrap", wordBreak: "break-word", borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: m.role === "user" ? `linear-gradient(135deg, ${agent.color}28, ${agent.accent}18)` : "#1c1b18", border: m.role === "user" ? `1px solid ${agent.color}40` : "1px solid #252320" }}>{m.content}</div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg, ${agent.color}, ${agent.accent})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{agent.emoji}</div>
            <div style={{ padding: "12px 16px", background: "#1c1b18", border: "1px solid #252320", borderRadius: "18px 18px 18px 4px", display: "flex", gap: 5, alignItems: "center" }}>
              {[0,1,2].map(j => <span key={j} style={{ width: 7, height: 7, borderRadius: "50%", background: agent.color, display: "inline-block", animation: `dot 1.2s ${j*0.2}s infinite ease-in-out` }} />)}
            </div>
          </div>
        )}

        {error && <div style={{ textAlign: "center", fontSize: 12, color: "#e06060", padding: "6px 12px", background: "#2a1515", borderRadius: 8, border: "1px solid #5a2020" }}>⚠️ {error}</div>}
        <div ref={bottomRef} />
      </div>

      <div style={{ background: "#0f0e0c", borderTop: "1px solid #1e1c18", padding: "10px 12px", display: "flex", gap: 8, alignItems: "flex-end", flexShrink: 0 }}>
        <textarea ref={taRef} value={input} placeholder={agent.placeholder}
          onChange={e => { setInput(e.target.value); e.target.style.height = "46px"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          rows={1} style={{ flex: 1, height: 46, maxHeight: 120, background: "#1a1815", border: `1.5px solid ${agent.color}35`, borderRadius: 23, padding: "12px 16px", color: "#e8e0d0", fontSize: 15, fontFamily: "inherit", resize: "none", outline: "none", lineHeight: 1.4, overflowY: "auto" }}
        />
        <button onClick={send} disabled={!input.trim() || loading} style={{ width: 46, height: 46, borderRadius: "50%", border: "none", flexShrink: 0, cursor: !input.trim() || loading ? "default" : "pointer", fontSize: 18, background: !input.trim() || loading ? "#222" : `linear-gradient(135deg, ${agent.color}, ${agent.accent})`, color: "#0f0e0c", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }}>➤</button>
      </div>

      <style>{`
        @keyframes dot { 0%,60%,100%{transform:scale(.7);opacity:.3} 30%{transform:scale(1.2);opacity:1} }
        * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
        ::-webkit-scrollbar { display: none; }
        textarea::placeholder { color: #3a3428; }
      `}</style>
    </div>
  );
}
