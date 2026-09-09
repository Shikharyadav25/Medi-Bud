"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { askAI, askAIWithImage } from "@/lib/gemini";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  doc, getDoc, collection, addDoc, setDoc,
  query, orderBy, onSnapshot, serverTimestamp, deleteDoc, getDocs, updateDoc
} from "firebase/firestore";
import {
  Circle, Droplets, Flower2, Heart, Scale, Stethoscope,
  Mic, MicOff, ImagePlus, X, Check, AlertTriangle, Activity,
  Zap, Leaf, Shield, Flame, Utensils, Pill, Info, Star, Thermometer,
  Plus, Trash2, MessageSquare, PenSquare, ChevronDown, ArrowLeft, MapPin
} from "lucide-react";
import { auth, db } from "@/lib/firebase";

type Message = { id?: string; role: "user" | "assistant"; content: string };
type Conversation = { id: string; title: string; updatedAt: any };
type Condition = { value: string; label: string; icon: React.ReactNode };

const CONDITIONS: Condition[] = [
  { value: "", label: "No Condition", icon: <Circle size={13} strokeWidth={1.5} color="rgba(255,255,255,0.4)" /> },
  { value: "Diabetes", label: "Diabetes", icon: <Droplets size={13} strokeWidth={1.5} color="#f87171" /> },
  { value: "PCOS", label: "PCOS", icon: <Flower2 size={13} strokeWidth={1.5} color="#e879a0" /> },
  { value: "Hypertension", label: "Hypertension", icon: <Heart size={13} strokeWidth={1.5} color="#fb923c" /> },
  { value: "Obesity", label: "Obesity", icon: <Scale size={13} strokeWidth={1.5} color="#a78bfa" /> },
];

// ── Formatters ─────────────────────────────────────────────
function formatText(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<p style="color:#c4b5fd;font-weight:700;font-size:0.78rem;margin:10px 0 3px;letter-spacing:0.06em;text-transform:uppercase;">$1</p>')
    .replace(/^## (.+)$/gm, '<p style="color:#fff;font-weight:700;font-size:0.9rem;margin:10px 0 4px;">$1</p>')
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#fff;font-weight:600;">$1</strong>')
    .replace(/\*([^*\n]+)\*/g, '<em style="color:rgba(255,255,255,0.55);font-style:italic;">$1</em>')
    .replace(/^[-•] (.+)$/gm, '<li style="margin:2px 0;">$1</li>')
    .replace(/((?:<li[^>]*>[^<]*<\/li>\s*)+)/g, (m) => `<ul style="margin:6px 0 6px 16px;list-style:disc;display:flex;flex-direction:column;gap:2px;">${m}</ul>`)
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid rgba(255,255,255,0.07);margin:10px 0;"/>')
    .replace(/\n{2,}/g, '<br/>')
    .replace(/\n/g, ' ');
}

type CardDef = { type: string; icon?: string; label: string; value?: string; text?: string; badge?: string };

const CARD_COLORS: Record<string, { bg: string; border: string; accent: string }> = {
  stat:   { bg: "rgba(37,99,235,0.1)",    border: "rgba(37,99,235,0.25)",    accent: "#60a5fa" },
  tip:    { bg: "rgba(74,222,128,0.08)",  border: "rgba(74,222,128,0.25)",   accent: "#4ade80" },
  warn:   { bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.25)",  accent: "#f87171" },
  avoid:  { bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.25)",  accent: "#f87171" },
  remedy: { bg: "rgba(167,139,250,0.1)",  border: "rgba(167,139,250,0.25)",  accent: "#a78bfa" },
  food:   { bg: "rgba(251,146,60,0.08)",  border: "rgba(251,146,60,0.25)",   accent: "#fb923c" },
  med:    { bg: "rgba(34,211,238,0.08)",  border: "rgba(34,211,238,0.2)",    accent: "#22d3ee" },
};

const ICON_MAP: Record<string, React.ReactNode> = {
  check: <Check size={14} strokeWidth={2} />, x: <X size={14} strokeWidth={2} />,
  alert: <AlertTriangle size={14} strokeWidth={2} />, heart: <Heart size={14} strokeWidth={2} />,
  activity: <Activity size={14} strokeWidth={2} />, zap: <Zap size={14} strokeWidth={2} />,
  leaf: <Leaf size={14} strokeWidth={2} />, droplet: <Droplets size={14} strokeWidth={2} />,
  scale: <Scale size={14} strokeWidth={2} />, shield: <Shield size={14} strokeWidth={2} />,
  flame: <Flame size={14} strokeWidth={2} />, utensils: <Utensils size={14} strokeWidth={2} />,
  pill: <Pill size={14} strokeWidth={2} />, info: <Info size={14} strokeWidth={2} />,
  star: <Star size={14} strokeWidth={2} />, thermometer: <Thermometer size={14} strokeWidth={2} />,
};

function getCardIcon(iconKey?: string, type?: string): React.ReactNode {
  if (iconKey && ICON_MAP[iconKey]) return ICON_MAP[iconKey];
  const d: Record<string, string> = { tip: "check", warn: "alert", avoid: "x", remedy: "leaf", food: "utensils", stat: "activity", med: "pill" };
  return ICON_MAP[d[type || ""] || "info"] || ICON_MAP.info;
}

function ChatMessage({ content }: { content: string }) {
  const cardMatch = content.match(/<cards>([\s\S]*?)<\/cards>/i);
  const textPart = content.replace(/<cards>[\s\S]*?<\/cards>/i, "").trim();
  let cards: CardDef[] = [];
  if (cardMatch) { try { cards = JSON.parse(cardMatch[1].trim()); } catch {} }
  return (
    <div>
      {textPart && <span dangerouslySetInnerHTML={{ __html: formatText(textPart) }} />}
      {cards.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: cards.length === 1 ? "1fr" : "repeat(2, 1fr)", gap: 8, marginTop: 12 }}>
          {cards.map((card, i) => {
            const c = CARD_COLORS[card.type] || CARD_COLORS.stat;
            return (
              <div key={i} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 14, padding: "11px 13px", display: "flex", flexDirection: "column", gap: 5 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: c.accent, display: "flex", alignItems: "center", flexShrink: 0 }}>{getCardIcon(card.icon, card.type)}</span>
                  <span style={{ fontSize: "0.63rem", fontWeight: 700, color: c.accent, textTransform: "uppercase", letterSpacing: "0.07em" }}>{card.label}</span>
                </div>
                {card.value && (
                  <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", lineHeight: 1, display: "flex", alignItems: "center", gap: 8 }}>
                    {card.value}
                    {card.badge && <span style={{ fontSize: "0.6rem", background: c.border, color: c.accent, padding: "2px 7px", borderRadius: 100, fontWeight: 600 }}>{card.badge}</span>}
                  </div>
                )}
                {card.text && <p style={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.55, margin: 0 }}>{card.text}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────
export default function ChatPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [disease, setDisease] = useState<string>("");
  const [language, setLanguage] = useState("en");
  const [conditionOpen, setConditionOpen] = useState(false);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConvId, setCurrentConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMobileList, setIsMobileList] = useState(true);

  const [isListening, setIsListening] = useState(false);
  const [imageData, setImageData] = useState<{ base64: string; mimeType: string; previewUrl: string } | null>(null);

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ── Language sync
  useEffect(() => {
    const handle = () => setLanguage(localStorage.getItem("medibud_lang") || "en");
    handle();
    window.addEventListener("languageChange", handle);
    return () => window.removeEventListener("languageChange", handle);
  }, []);

  // ── Auth + profile
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u); setAuthReady(true);
      if (u) {
        const snap = await getDoc(doc(db, "profiles", u.uid));
        if (snap.exists()) setProfile(snap.data());
      }
    });
    return () => unsub();
  }, []);

  // ── Voice recognition
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.continuous = true; r.interimResults = true;
    r.lang = language === "en" ? "en-IN" : language;
    r.onresult = (e: any) => {
      let t = "";
      for (let i = e.resultIndex; i < e.results.length; ++i) if (e.results[i].isFinal) t += e.results[i][0].transcript;
      if (t) setInput(p => p + (p.endsWith(" ") ? "" : " ") + t);
    };
    r.onend = () => setIsListening(false);
    recognitionRef.current = r;
  }, [language]);

  const toggleVoice = () => {
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); }
    else { try { recognitionRef.current?.start(); setIsListening(true); } catch {} }
  };

  // ── Image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const r = reader.result as string;
      setImageData({ base64: r.split(",")[1], mimeType: file.type, previewUrl: r });
      setInput("Analyse this food image for me. Tell me its nutritional value, health impact, portion advice, and whether it suits my health conditions and allergies.");
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => { setImageData(null); setInput(""); if (fileInputRef.current) fileInputRef.current.value = ""; };

  // ── Load conversation list
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "chats", user.uid, "conversations"), orderBy("updatedAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setConversations(snap.docs.map(d => ({ id: d.id, title: d.data().title || "New Chat", updatedAt: d.data().updatedAt })));
    });
    return () => unsub();
  }, [user]);

  // ── Load messages for current conversation
  useEffect(() => {
    if (!user || !currentConvId) { setMessages([]); return; }
    const q = query(collection(db, "chats", user.uid, "conversations", currentConvId, "messages"), orderBy("timestamp", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, role: d.data().role, content: d.data().content })));
    });
    return () => unsub();
  }, [user, currentConvId]);

  // ── Scroll to bottom
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages, loading]);


  // ── New conversation
  const startNewConversation = useCallback(async () => {
    if (!user) return;
    const ref = await addDoc(collection(db, "chats", user.uid, "conversations"), {
      title: "New Chat",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    setCurrentConvId(ref.id);
    setMessages([]);
    setIsMobileList(false);
  }, [user]);

  // ── Delete conversation
  const deleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    // Delete all messages subcollection
    const msgsSnap = await getDocs(collection(db, "chats", user.uid, "conversations", convId, "messages"));
    await Promise.all(msgsSnap.docs.map(d => deleteDoc(d.ref)));
    await deleteDoc(doc(db, "chats", user.uid, "conversations", convId));
    if (currentConvId === convId) { setCurrentConvId(null); setMessages([]); }
  };

  // ── Send message
  const handleSend = async () => {
    if (!input.trim() && !imageData) return;
    if (!user) return;

    let convId = currentConvId;
    if (!convId) {
      const ref = await addDoc(collection(db, "chats", user.uid, "conversations"), {
        title: input.slice(0, 50) || "Food Analysis",
        createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
      });
      convId = ref.id;
      setCurrentConvId(convId);
    }

    const userContent = imageData ? `📷 Food Image: ${input}` : input;
    const userMsg: Message = { role: "user", content: userContent };
    setMessages(prev => [...prev, userMsg]);

    await addDoc(collection(db, "chats", user.uid, "conversations", convId, "messages"), {
      role: "user", content: userContent, timestamp: serverTimestamp(),
    });

    // Update title if first message
    if (messages.length === 0) {
      await updateDoc(doc(db, "chats", user.uid, "conversations", convId), {
        title: input.slice(0, 60) || "Food Analysis", updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(doc(db, "chats", user.uid, "conversations", convId), { updatedAt: serverTimestamp() });
    }

    const currentInput = input;
    const currentImage = imageData;
    setInput(""); setImageData(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setLoading(true);

    const bmi = profile?.heightCm && profile?.weightKg
      ? (parseFloat(profile.weightKg) / Math.pow(parseFloat(profile.heightCm) / 100, 2)).toFixed(1)
      : "N/A";

    const prompt = `You are Medi Bud, an expert AI family doctor and health companion for Indian consumers. You are warm, culturally attuned, and practical.

USER PROFILE (deeply reference these in your response):
- Name: ${user?.displayName || "there"}, Age: ${profile?.age || "N/A"}, Gender: ${profile?.gender || "N/A"}
- BMI: ${bmi}
- Conditions: ${profile?.healthIssues || "none"} | Medications: ${profile?.medications || "none"} | Allergies: ${profile?.allergies || "none"}
- Today's Focus: ${disease || "General Health"}

RESPONSE FORMAT (STRICTLY FOLLOW THIS STRUCTURE):

1. TEXT SECTION (4-7 sentences): Write a warm, knowledgeable response that:
   - Directly addresses their question with specific, actionable detail
   - References their conditions, BMI, or medications naturally
   - Includes specific **nutritional values** if food is involved (calories, carbs, protein, fat — approximate)
   - Mentions an Indian household remedy or tip where relevant
   - Uses **bold** for key terms, - for bullet lists if needed
   - Ends with: *Always consult your doctor for personalised advice.*

2. CARDS SECTION: After the text, output exactly one <cards> JSON block with 3-4 cards:
   Schema: { type: "stat"|"tip"|"warn"|"avoid"|"remedy"|"food"|"med", icon: "<key>", label: "<max 20 chars>", value?: "<short metric>", badge?: "<status>", text: "<max 80 chars>" }
   Icon keys (use ONLY these): check, x, alert, heart, activity, zap, leaf, droplet, scale, shield, flame, utensils, pill, info, star, thermometer
- NEVER suggest allergens: ${profile?.allergies || "none"}.
- Consider drug interactions: ${profile?.medications || "none"}.

User asks: "${currentInput}"
Respond in language '${language}'. If not 'en', translate TEXT authentically, but keep JSON card field values in English:`;

    const imagePromptSuffix = currentImage ? `

The user has also uploaded a food image. Please carefully analyze it:
- Identify the dish and its key ingredients.
- Estimate nutritional breakdown (calories, carbs, proteins, fats — approximate).
- Explain how it impacts the user's specific conditions: ${profile?.healthIssues || "none"}.
- Give a clear EAT / AVOID / MODIFY recommendation.
- Note any allergen risks based on: ${profile?.allergies || "none"}.` : "";

    try {
      const aiResponse = currentImage
        ? await askAIWithImage(prompt + imagePromptSuffix, currentImage.base64, currentImage.mimeType)
        : await askAI(prompt);

      setMessages(prev => [...prev, { role: "assistant", content: aiResponse }]);
      await addDoc(collection(db, "chats", user.uid, "conversations", convId!, "messages"), {
        role: "assistant", content: aiResponse, timestamp: serverTimestamp(),
      });
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
    }
    setLoading(false);
  };

  const selected = CONDITIONS.find(c => c.value === disease) || CONDITIONS[0];

  if (!authReady) return <div style={{ height: "100vh", background: "#06060e", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "Sora, sans-serif" }}>Loading…</div>;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .chat-shell {
          height: 100vh;
          display: flex;
          background: #070712;
          font-family: 'Sora', sans-serif;
          color: rgba(255,255,255,0.88);
          padding-top: 72px;
          overflow: hidden;
        }

        /* ── SIDEBAR ──────────────────────────────────── */
        .chat-sidebar {
          width: 272px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          background: linear-gradient(180deg, #0d0c1e 0%, #0a0916 100%);
          border-right: 1px solid rgba(124,58,237,0.12);
          height: 100%;
          transition: width 0.28s cubic-bezier(0.4,0,0.2,1), opacity 0.2s;
          overflow: hidden;
          position: relative;
          z-index: 10;
        }
        .chat-sidebar::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(124,58,237,0.4), transparent);
        }
        .chat-sidebar.collapsed { width: 0; opacity: 0; pointer-events: none; }

        .sidebar-top {
          padding: 16px 14px 14px;
          flex-shrink: 0;
        }
        .new-chat-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 11px 16px;
          background: linear-gradient(135deg, rgba(124,58,237,0.22), rgba(79,70,229,0.18));
          border: 1px solid rgba(124,58,237,0.35);
          border-radius: 13px;
          color: #c4b5fd;
          font-size: 0.83rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.22s;
          font-family: 'Sora', sans-serif;
          letter-spacing: 0.01em;
          box-shadow: 0 2px 16px rgba(124,58,237,0.12);
        }
        .new-chat-btn:hover {
          background: linear-gradient(135deg, rgba(124,58,237,0.35), rgba(79,70,229,0.28));
          border-color: rgba(124,58,237,0.55);
          color: #fff;
          box-shadow: 0 4px 24px rgba(124,58,237,0.25);
          transform: translateY(-1px);
        }

        .conv-list {
          flex: 1;
          overflow-y: auto;
          padding: 6px 10px;
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .conv-list::-webkit-scrollbar { width: 2px; }
        .conv-list::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.25); border-radius: 2px; }

        .conv-group-label {
          font-size: 0.58rem;
          font-weight: 700;
          color: rgba(255,255,255,0.2);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 12px 6px 5px;
        }

        .conv-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          border: 1px solid transparent;
        }
        .conv-item:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.07);
        }
        .conv-item.active {
          background: linear-gradient(135deg, rgba(124,58,237,0.2), rgba(79,70,229,0.15));
          border-color: rgba(124,58,237,0.25);
        }
        .nearby-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 14px;
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.05));
          border: 1px solid rgba(34, 197, 94, 0.2);
          color: #4ade80;
          font-size: 0.85rem;
          font-weight: 600;
          text-decoration: none;
          margin-bottom: 24px;
          transition: all 0.2s;
        }
        .nearby-link:hover {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(16, 185, 129, 0.1));
          border-color: rgba(34, 197, 94, 0.4);
          transform: translateY(-1px);
        }
        .conv-item.active::before {
          content: '';
          position: absolute;
          left: 0; top: 25%; bottom: 25%;
          width: 2px;
          background: linear-gradient(to bottom, #7c3aed, #4f46e5);
          border-radius: 0 2px 2px 0;
        }
        .conv-icon { flex-shrink: 0; color: rgba(255,255,255,0.25); transition: color 0.15s; }
        .conv-item.active .conv-icon { color: #a78bfa; }
        .conv-item:hover .conv-icon { color: rgba(255,255,255,0.5); }
        .conv-title {
          flex: 1;
          font-size: 0.88rem;
          color: rgba(255,255,255,0.6);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.4;
          transition: color 0.15s;
        }
        .conv-item.active .conv-title { color: rgba(255,255,255,0.88); font-weight: 500; }
        .conv-item:hover .conv-title { color: rgba(255,255,255,0.75); }
        .conv-delete {
          opacity: 0;
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255,255,255,0.3);
          padding: 3px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          transition: all 0.15s;
          flex-shrink: 0;
        }
        .conv-item:hover .conv-delete { opacity: 1; }
        .conv-delete:hover { color: #f87171; background: rgba(248,113,113,0.12); }

        .sidebar-bottom {
          padding: 12px 14px 16px;
          border-top: 1px solid rgba(255,255,255,0.05);
          flex-shrink: 0;
          background: rgba(0,0,0,0.15);
        }
        .cond-label {
          font-size: 0.56rem;
          color: rgba(255,255,255,0.25);
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 7px;
        }
        .condition-select {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 11px;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Sora', sans-serif;
          color: rgba(255,255,255,0.6);
          font-size: 0.78rem;
          position: relative;
        }
        .condition-select:hover {
          background: rgba(255,255,255,0.07);
          border-color: rgba(255,255,255,0.13);
        }
        .cond-dropdown {
          position: absolute;
          bottom: calc(100% + 8px);
          left: 0; right: 0;
          background: #141325;
          border: 1px solid rgba(124,58,237,0.2);
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 -20px 50px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,0,0,0.3);
          z-index: 20;
          animation: slideUp 0.15s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes slideUp { from{opacity:0;transform:translateY(10px) scale(0.97);}to{opacity:1;transform:translateY(0) scale(1);} }
        .cond-option {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 10px 14px;
          cursor: pointer;
          font-size: 0.8rem;
          color: rgba(255,255,255,0.6);
          transition: background 0.12s;
        }
        .cond-option:hover { background: rgba(255,255,255,0.05); color: #fff; }
        .cond-option.active { color: #c4b5fd; background: rgba(124,58,237,0.12); font-weight: 500; }

        /* ── MAIN AREA ────────────────────────────────── */
        .chat-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          height: 100%;
        }

        .chat-topbar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          flex-shrink: 0;
          background: rgba(7,7,18,0.95);
          backdrop-filter: blur(12px);
        }
        .mobile-back {
          display: none;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          cursor: pointer;
          color: rgba(255,255,255,0.7);
          align-items: center;
          padding: 8px;
          border-radius: 9px;
          margin-right: 4px;
        }
        .topbar-title {
          font-size: 0.84rem;
          font-weight: 600;
          color: rgba(255,255,255,0.8);
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .topbar-badge {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 3px 9px;
          background: rgba(34,197,94,0.1);
          border: 1px solid rgba(34,197,94,0.2);
          border-radius: 20px;
          font-size: 0.62rem;
          color: #4ade80;
          font-weight: 600;
          letter-spacing: 0.04em;
          white-space: nowrap;
        }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 6px #22c55e; animation: pulse-dot 2s ease-in-out infinite; }
        @keyframes pulse-dot { 0%,100%{opacity:1;}50%{opacity:0.4;} }

        /* ── MESSAGES ─────────────────────────────────── */
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 28px 0 8px;
          display: flex;
          flex-direction: column;
        }
        .chat-messages::-webkit-scrollbar { width: 3px; }
        .chat-messages::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.2); border-radius: 3px; }

        .msg-row {
          padding: 6px 28px;
          display: flex;
          gap: 14px;
          animation: msgIn 0.22s cubic-bezier(0.34,1.56,0.64,1);
          max-width: 820px;
          margin: 0 auto;
          width: 100%;
        }
        @keyframes msgIn { from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);} }
        .msg-row.user { flex-direction: row-reverse; }

        .msg-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 13px;
          margin-top: 3px;
          font-weight: 700;
          letter-spacing: 0;
        }
        .msg-avatar.ai {
          background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%);
          box-shadow: 0 3px 14px rgba(124,58,237,0.45);
          color: #fff;
        }
        .msg-avatar.user-av {
          background: linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06));
          border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.7);
          font-size: 11px;
        }

        .msg-content {
          flex: 1;
          max-width: 74%;
          font-size: 0.85rem;
          line-height: 1.68;
        }
        .msg-row.user .msg-content { display: flex; justify-content: flex-end; }

        .msg-bubble {
          padding: 12px 17px;
          border-radius: 18px;
          word-break: break-word;
        }
        .msg-bubble.user {
          background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);
          color: #fff;
          border-bottom-right-radius: 5px;
          box-shadow: 0 6px 24px rgba(124,58,237,0.35);
          font-size: 0.84rem;
          max-width: 100%;
        }
        .msg-bubble.ai {
          background: transparent;
          color: rgba(255,255,255,0.85);
          padding: 6px 0;
        }
        .msg-bubble strong { color: #fff; font-weight: 600; }

        .typing-dots {
          display: flex;
          gap: 5px;
          align-items: center;
          padding: 14px 4px;
        }
        .typing-dots span {
          width: 7px; height: 7px;
          background: rgba(167,139,250,0.5);
          border-radius: 50%;
          animation: bounce 1.2s ease-in-out infinite;
        }
        .typing-dots span:nth-child(2){animation-delay:0.2s;} .typing-dots span:nth-child(3){animation-delay:0.4s;}
        @keyframes bounce { 0%,60%,100%{transform:translateY(0);}30%{transform:translateY(-5px);} }

        /* ── EMPTY STATE ──────────────────────────────── */
        .chat-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 50px 24px;
          text-align: center;
        }
        .empty-icon {
          width: 64px; height: 64px;
          background: linear-gradient(135deg, rgba(124,58,237,0.18), rgba(37,99,235,0.12));
          border: 1px solid rgba(124,58,237,0.25);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 6px;
          box-shadow: 0 8px 32px rgba(124,58,237,0.15);
        }
        .empty-title {
          font-family: 'DM Serif Display', serif;
          font-size: 1.6rem;
          color: rgba(255,255,255,0.8);
          letter-spacing: -0.02em;
        }
        .empty-sub {
          font-size: 0.83rem;
          color: rgba(255,255,255,0.3);
          max-width: 340px;
          line-height: 1.65;
          margin-top: 2px;
        }
        .starter-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
          margin-top: 20px;
          max-width: 520px;
        }
        .starter-chip {
          padding: 8px 18px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 20px;
          color: rgba(255,255,255,0.55);
          font-size: 0.78rem;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Sora', sans-serif;
        }
        .starter-chip:hover {
          background: rgba(124,58,237,0.15);
          border-color: rgba(124,58,237,0.3);
          color: #c4b5fd;
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(124,58,237,0.15);
        }

        /* ── INPUT AREA ───────────────────────────────── */
        .chat-input-area {
          flex-shrink: 0;
          padding: 10px 20px 16px;
          max-width: 820px;
          margin: 0 auto;
          width: 100%;
        }
        .img-preview-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
          background: rgba(167,139,250,0.06);
          border: 1px solid rgba(167,139,250,0.18);
          border-radius: 12px;
          padding: 8px 12px;
        }
        .img-thumb { width: 40px; height: 40px; object-fit: cover; border-radius: 8px; }
        .img-clear { background: none; border: none; cursor: pointer; color: rgba(255,255,255,0.3); display: flex; align-items: center; transition: color 0.2s; border-radius: 6px; padding: 2px; }
        .img-clear:hover { color: #f87171; }

        .input-box {
          display: flex;
          gap: 8px;
          align-items: flex-end;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 18px;
          padding: 8px 8px 8px 16px;
          transition: border-color 0.2s, box-shadow 0.25s;
          box-shadow: 0 2px 16px rgba(0,0,0,0.25);
        }
        .input-box:focus-within {
          border-color: rgba(124,58,237,0.5);
          box-shadow: 0 0 0 3px rgba(124,58,237,0.1), 0 4px 20px rgba(0,0,0,0.3);
        }
        .chat-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #fff;
          font-family: 'Sora', sans-serif;
          font-size: 0.86rem;
          resize: none;
          max-height: 120px;
          line-height: 1.55;
          padding: 5px 0;
        }
        .chat-input::placeholder { color: rgba(255,255,255,0.2); }
        .input-actions { display: flex; gap: 5px; align-items: center; flex-shrink: 0; }
        .icon-btn {
          width: 36px; height: 36px;
          border-radius: 10px;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .icon-btn.ghost {
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.35);
          border: 1px solid rgba(255,255,255,0.06);
        }
        .icon-btn.ghost:hover { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.75); border-color: rgba(255,255,255,0.12); }
        .icon-btn.mic-active { background: #ef4444; color: #fff; box-shadow: 0 4px 14px rgba(239,68,68,0.4); }
        .icon-btn.send {
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          color: #fff;
          box-shadow: 0 4px 16px rgba(124,58,237,0.4);
          font-size: 16px;
          border: none;
        }
        .icon-btn.send:hover:not(:disabled) {
          box-shadow: 0 6px 22px rgba(124,58,237,0.55);
          transform: translateY(-1px);
        }
        .icon-btn.send:disabled { opacity: 0.3; cursor: not-allowed; transform: none; }
        .icon-btn.img-active { background: rgba(167,139,250,0.18); color: #a78bfa; border: 1px solid rgba(167,139,250,0.3); }
        .input-footer {
          text-align: center;
          font-size: 0.59rem;
          color: rgba(255,255,255,0.15);
          margin-top: 9px;
          letter-spacing: 0.03em;
        }

        /* ── UNAUTHENTICATED STATE ────────────────── */
        .auth-gate {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 12px;
          padding: 40px;
          text-align: center;
        }
        .auth-gate p { font-size: 0.85rem; color: rgba(255,255,255,0.4); }
        .auth-gate a {
          padding: 11px 28px;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          color: #fff;
          border-radius: 12px;
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 600;
          box-shadow: 0 4px 18px rgba(124,58,237,0.4);
        }

        /* ── RESPONSIVE ───────────────────────────── */
        @media (max-width: 768px) {
          .chat-shell { padding-top: 52px; }

          /* WhatsApp-like layout: fully hide the inactive view */
          .chat-shell.mobile-list-active .chat-main { display: none !important; }
          .chat-shell.mobile-chat-active .chat-sidebar { display: none !important; }

          .chat-sidebar {
            width: 100% !important;
            border-right: none;
          }

          .mobile-back { display: flex; }

          .chat-topbar { padding: 10px 14px; gap: 8px; }

          .msg-row { padding: 6px 14px; }
          .msg-content { max-width: 88%; }
          .chat-input-area { padding: 8px 12px 14px; }
          .starter-chips { gap: 6px; }
          .starter-chip { padding: 7px 13px; font-size: 0.74rem; }
          .empty-title { font-size: 1.3rem; }
        }
      `}</style>
      
      <div className={`chat-shell ${isMobileList ? "mobile-list-active" : "mobile-chat-active"}`}>

        {/* ── SIDEBAR ── */}
        <aside className="chat-sidebar">
          <div className="sidebar-top">
            <a href="/nearby" className="nearby-link">
              <MapPin size={18} strokeWidth={2} />
              Find Nearby Care
            </a>

            <button className="new-chat-btn" onClick={() => startNewConversation()}>
              <Plus size={18} strokeWidth={2} />
              New Chat
            </button>
          </div>

          <div className="conv-list">
            {conversations.length === 0 ? (
              <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.2)", textAlign: "center", padding: "24px 12px" }}>
                No conversations yet.<br />Start a new chat!
              </p>
            ) : (
              <>
                <div className="conv-group-label">Recent</div>
                {conversations.map(conv => (
                  <div
                    key={conv.id}
                    className={`conv-item ${currentConvId === conv.id ? "active" : ""}`}
                    onClick={() => {
                      setCurrentConvId(conv.id);
                      setIsMobileList(false);
                    }}
                  >
                    <MessageSquare size={14} strokeWidth={1.5} className="conv-icon" />
                    <span className="conv-title">{conv.title}</span>
                    <button
                      className="conv-delete"
                      onClick={(e) => deleteConversation(conv.id, e)}
                      title="Delete chat"
                    >
                      <Trash2 size={13} strokeWidth={1.5} />
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>

          <div className="sidebar-bottom">
            <div className="cond-label">Focus Condition</div>
            <div className="condition-select" onClick={() => setConditionOpen(v => !v)} style={{ position: "relative" }}>
              {conditionOpen && (
                <div className="cond-dropdown">
                  {CONDITIONS.map(c => (
                    <div
                      key={c.value}
                      className={`cond-option ${disease === c.value ? "active" : ""}`}
                      onClick={(e) => { e.stopPropagation(); setDisease(c.value); setConditionOpen(false); }}
                    >
                      {c.icon} {c.label}
                    </div>
                  ))}
                </div>
              )}
              <span>{selected.icon}</span>
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selected.label}</span>
              <ChevronDown size={13} style={{ opacity: 0.4, transform: conditionOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
            </div>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="chat-main">

          {/* Top bar */}
          <div className="chat-topbar">
            {isMobileList ? null : (
              <button className="mobile-back" onClick={() => setIsMobileList(true)} title="Back to menu">
                <ArrowLeft size={16} />
              </button>
            )}
            <span className="topbar-title">
              {currentConvId ? (conversations.find(c => c.id === currentConvId)?.title || "Chat") : "Medi Bud AI"}
            </span>
            <div className="topbar-badge">
              <div className="status-dot" />
              Online
            </div>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {!currentConvId || messages.length === 0 ? (
              <div className="chat-empty">
                <div className="empty-icon">
                  <Stethoscope size={26} color="#a78bfa" strokeWidth={1.5} />
                </div>
                <h3 className="empty-title">How can I help you?</h3>
                <p className="empty-sub">Ask about symptoms, medications, diet, or upload a food photo for instant health analysis.</p>
                <div className="starter-chips">
                  {["What should I eat with diabetes?", "I have a headache", "Analyse my food", "Daily routine tips"].map(q => (
                    <button key={q} className="starter-chip" onClick={() => setInput(q)}>{q}</button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`msg-row ${msg.role}`}>
                  <div className={`msg-avatar ${msg.role === "assistant" ? "ai" : "user-av"}`}>
                    {msg.role === "assistant" ? "✦" : "U"}
                  </div>
                  <div className="msg-content">
                    <div className={`msg-bubble ${msg.role === "assistant" ? "ai" : "user"}`}>
                      {msg.role === "assistant"
                        ? <ChatMessage content={msg.content} />
                        : msg.content}
                    </div>
                  </div>
                </div>
              ))
            )}

            {loading && (
              <div className="msg-row">
                <div className="msg-avatar ai">✦</div>
                <div className="msg-content">
                  <div className="typing-dots"><span /><span /><span /></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="chat-input-area">
            {imageData && (
              <div className="img-preview-bar">
                <img className="img-thumb" src={imageData.previewUrl} alt="food" />
                <span style={{ flex: 1, fontSize: "0.75rem", color: "rgba(255,255,255,0.5)" }}>📷 Food image ready</span>
                <button className="img-clear" onClick={clearImage}><X size={15} /></button>
              </div>
            )}
            <div className="input-box">
              <input
                ref={fileInputRef as any}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageUpload}
              />
              <textarea
                className="chat-input"
                rows={1}
                value={input}
                onChange={e => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Ask your health question… (Shift+Enter for new line)"
              />
              <div className="input-actions">
                <button
                  className={`icon-btn ${imageData ? "img-active" : "ghost"}`}
                  onClick={() => (fileInputRef.current as any)?.click()}
                  title="Upload food image"
                >
                  <ImagePlus size={16} />
                </button>
                <button
                  className={`icon-btn ${isListening ? "mic-active" : "ghost"}`}
                  onClick={toggleVoice}
                  title={isListening ? "Stop listening" : "Voice input"}
                >
                  {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
                <button
                  className="icon-btn send"
                  onClick={handleSend}
                  disabled={loading || (!input.trim() && !imageData)}
                >
                  ↑
                </button>
              </div>
            </div>
            <div className="input-footer">For informational purposes only · Not a substitute for professional advice</div>
          </div>

        </main>
      </div>
    </>
  );
}