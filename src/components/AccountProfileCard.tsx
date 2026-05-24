"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, KeyRound, LogIn, LogOut, Mail, Save, Send, UserRound } from "lucide-react";
import { useGameStore } from "@/store/gameStore";

type User = {
  id: string;
  email: string;
  name: string;
  partner_name: string | null;
  zodiac: string | null;
  partner_zodiac: string | null;
  anniversary: string | null;
  love_language: string | null;
  relationship_note: string | null;
};

const zodiacOptions = [
  ["aries", "Овен", "Aries"],
  ["taurus", "Телец", "Taurus"],
  ["gemini", "Близнецы", "Gemini"],
  ["cancer", "Рак", "Cancer"],
  ["leo", "Лев", "Leo"],
  ["virgo", "Дева", "Virgo"],
  ["libra", "Весы", "Libra"],
  ["scorpio", "Скорпион", "Scorpio"],
  ["sagittarius", "Стрелец", "Sagittarius"],
  ["capricorn", "Козерог", "Capricorn"],
  ["aquarius", "Водолей", "Aquarius"],
  ["pisces", "Рыбы", "Pisces"],
];

export function AccountProfileCard({ compact = false }: { compact?: boolean }) {
  const language = useGameStore((state) => state.language);
  const setPlayers = useGameStore((state) => state.setPlayers);
  const isRu = language === "ru";
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [authMode, setAuthMode] = useState<"register" | "login">("register");
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
    code: "",
    name: "",
    partnerName: "",
    zodiac: "aries",
    partnerZodiac: "libra",
    anniversary: "",
    loveLanguage: "",
    relationshipNote: "",
  });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          const next = data.user as User;
          setUser(next);
          setForm({
            email: next.email ?? "",
            password: "",
            code: "",
            name: next.name ?? "",
            partnerName: next.partner_name ?? "",
            zodiac: next.zodiac ?? "aries",
            partnerZodiac: next.partner_zodiac ?? "libra",
            anniversary: next.anniversary ?? "",
            loveLanguage: next.love_language ?? "",
            relationshipNote: next.relationship_note ?? "",
          });
          if (next.name && next.partner_name) setPlayers(next.name, next.partner_name);
        }
      })
      .finally(() => setLoading(false));
  }, [setPlayers]);

  const requestCode = async () => {
    setSaving(true);
    setStatus("");
    const res = await fetch("/api/auth/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "request_code", email: form.email, password: form.password, language }),
    });
    const data = await res.json();
    if (res.ok) {
      setCodeSent(true);
      setStatus(
        data.sent
          ? isRu
            ? "Код отправлен на email."
            : "Code sent to your email."
          : isRu
            ? data.devCode
              ? `Почта на сервере не настроена. Демо-код: ${data.devCode}`
              : "Почта на сервере не настроена. Добавь Gmail SMTP в Vercel."
            : data.devCode
              ? `Email is not configured. Demo code: ${data.devCode}`
              : "Email is not configured. Add Gmail SMTP in Vercel."
      );
    } else {
      setStatus(data.error ?? (isRu ? "Не удалось отправить код." : "Could not send code."));
    }
    setSaving(false);
  };

  const submit = async () => {
    setSaving(true);
    setStatus("");
    const res = await fetch("/api/auth/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, mode: user ? "update" : "register", language }),
    });
    const data = await res.json();
    if (data.user) {
      setUser(data.user);
      setPlayers(form.name, form.partnerName);
      setStatus(isRu ? "Готово, профиль сохранен." : "Done, profile saved.");
    } else {
      setStatus(data.error ?? (isRu ? "Не получилось сохранить." : "Could not save."));
    }
    setSaving(false);
  };

  const login = async () => {
    setSaving(true);
    setStatus("");
    const res = await fetch("/api/auth/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "login", email: form.email, password: form.password }),
    });
    const data = await res.json();
    if (data.user) {
      const next = data.user as User;
      setUser(next);
      setForm({
        ...form,
        name: next.name ?? "",
        partnerName: next.partner_name ?? "",
        zodiac: next.zodiac ?? "aries",
        partnerZodiac: next.partner_zodiac ?? "libra",
        anniversary: next.anniversary ?? "",
        loveLanguage: next.love_language ?? "",
        relationshipNote: next.relationship_note ?? "",
      });
      if (next.name && next.partner_name) setPlayers(next.name, next.partner_name);
      setStatus(isRu ? "Вход выполнен." : "Logged in.");
    } else {
      setStatus(data.error ?? (isRu ? "Неверный email или пароль." : "Wrong email or password."));
    }
    setSaving(false);
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setCodeSent(false);
    setStatus("");
  };

  if (loading) return <div className="h-20 rounded-[24px] bg-white/55 animate-pulse" />;

  if (compact && user) {
    return (
      <div className="rounded-[24px] border border-white/55 bg-white/70 p-4 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-serif text-2xl font-bold text-[#2c2010]">{user.name} & {user.partner_name}</p>
            <p className="truncate text-sm text-[#6f5136]">{user.email}</p>
          </div>
          <button onClick={logout} aria-label="Logout" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#2c2010] text-white">
            <LogOut size={17} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[32px] border border-white/55 bg-white/74 p-5 shadow-[0_24px_80px_rgba(76,44,10,0.14)] backdrop-blur-xl md:p-7">
      <div className="mb-5 flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#2c2010] text-white">
          <UserRound size={21} />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#9a5a42]">
            {isRu ? "профиль пары" : "couple profile"}
          </p>
          <h2 className="font-serif text-3xl font-bold text-[#2c2010]">
            {user ? (isRu ? "Прогресс сохраняется" : "Progress is saved") : isRu ? "Регистрация через email" : "Email signup"}
          </h2>
        </div>
      </div>

      {!user && (
        <div className="mb-4 grid grid-cols-2 gap-2 rounded-[22px] bg-[#fff8e8]/70 p-1">
          <button
            type="button"
            onClick={() => setAuthMode("register")}
            className={`rounded-[18px] px-4 py-3 font-bold transition ${authMode === "register" ? "bg-[#2c2010] text-white" : "text-[#6f5136]"}`}
          >
            {isRu ? "Регистрация" : "Sign up"}
          </button>
          <button
            type="button"
            onClick={() => setAuthMode("login")}
            className={`rounded-[18px] px-4 py-3 font-bold transition ${authMode === "login" ? "bg-[#2c2010] text-white" : "text-[#6f5136]"}`}
          >
            {isRu ? "Вход" : "Login"}
          </button>
        </div>
      )}

      <div className="grid gap-3">
        <input className="rounded-2xl border border-[#2c2010]/10 bg-[#fff8e8] px-4 py-3 outline-none" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        {!user && (
          <input
            className="rounded-2xl border border-[#2c2010]/10 bg-[#fff8e8] px-4 py-3 outline-none"
            placeholder={isRu ? "Пароль минимум 6 символов" : "Password, at least 6 characters"}
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        )}
        {(user || authMode === "register") && (
          <>
            {!user && (
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <input
                  className="rounded-2xl border border-[#2c2010]/10 bg-[#fff8e8] px-4 py-3 outline-none"
                  placeholder={isRu ? "Код из письма" : "Email code"}
                  inputMode="numeric"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                />
                <button
                  type="button"
                  onClick={requestCode}
                  disabled={saving || !form.email || form.password.length < 6}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#c9605a] px-5 py-3 font-bold text-white transition hover:-translate-y-0.5 disabled:opacity-50"
                >
                  <Send size={17} />
                  {codeSent ? (isRu ? "Еще раз" : "Again") : isRu ? "Код" : "Code"}
                </button>
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="rounded-2xl border border-[#2c2010]/10 bg-[#fff8e8] px-4 py-3 outline-none" placeholder={isRu ? "Твое имя" : "Your name"} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className="rounded-2xl border border-[#2c2010]/10 bg-[#fff8e8] px-4 py-3 outline-none" placeholder={isRu ? "Имя пары" : "Partner name"} value={form.partnerName} onChange={(e) => setForm({ ...form, partnerName: e.target.value })} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <select className="rounded-2xl border border-[#2c2010]/10 bg-[#fff8e8] px-4 py-3 outline-none" value={form.zodiac} onChange={(e) => setForm({ ...form, zodiac: e.target.value })}>
                {zodiacOptions.map(([value, ru, en]) => <option key={value} value={value}>{isRu ? `Ты: ${ru}` : `You: ${en}`}</option>)}
              </select>
              <select className="rounded-2xl border border-[#2c2010]/10 bg-[#fff8e8] px-4 py-3 outline-none" value={form.partnerZodiac} onChange={(e) => setForm({ ...form, partnerZodiac: e.target.value })}>
                {zodiacOptions.map(([value, ru, en]) => <option key={value} value={value}>{isRu ? `Пара: ${ru}` : `Partner: ${en}`}</option>)}
              </select>
            </div>
            <input className="rounded-2xl border border-[#2c2010]/10 bg-[#fff8e8] px-4 py-3 outline-none" placeholder={isRu ? "Дата знакомства / годовщина" : "First date / anniversary"} value={form.anniversary} onChange={(e) => setForm({ ...form, anniversary: e.target.value })} />
            <input className="rounded-2xl border border-[#2c2010]/10 bg-[#fff8e8] px-4 py-3 outline-none" placeholder={isRu ? "Ваш язык любви" : "Your love language"} value={form.loveLanguage} onChange={(e) => setForm({ ...form, loveLanguage: e.target.value })} />
            <textarea className="min-h-24 resize-none rounded-2xl border border-[#2c2010]/10 bg-[#fff8e8] px-4 py-3 outline-none" placeholder={isRu ? "Что важно знать о вашей паре?" : "What should the game know about you two?"} value={form.relationshipNote} onChange={(e) => setForm({ ...form, relationshipNote: e.target.value })} />
          </>
        )}
      </div>

      {status && (
        <p className="mt-4 rounded-2xl bg-white/60 px-4 py-3 text-sm font-semibold text-[#6f5136]">
          {status}
        </p>
      )}

      <button
        onClick={authMode === "login" && !user ? login : submit}
        disabled={
          saving ||
          !form.email ||
          (!user && !form.password) ||
          (authMode === "register" && !user && (!form.code || !form.name || !form.partnerName)) ||
          (!!user && (!form.name || !form.partnerName))
        }
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-[24px] bg-[#2c2010] px-5 py-4 font-semibold text-white shadow-[0_16px_35px_rgba(44,32,16,0.22)] transition hover:-translate-y-0.5 disabled:opacity-50"
      >
        {saving ? (
          <Mail size={18} />
        ) : user ? (
          <Save size={18} />
        ) : authMode === "login" ? (
          <LogIn size={18} />
        ) : (
          <CheckCircle2 size={18} />
        )}
        {saving
          ? isRu
            ? "Подождите..."
            : "Please wait..."
          : user
            ? isRu
              ? "Обновить профиль"
              : "Update profile"
            : authMode === "login"
              ? isRu
                ? "Войти"
                : "Login"
              : isRu
                ? "Подтвердить и создать"
                : "Verify and create"}
      </button>

      {!user && authMode === "register" && (
        <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-[#8b5043]">
          <KeyRound className="mt-0.5 shrink-0" size={14} />
          {isRu
            ? "Код нужен, чтобы никто не создал профиль на чужой email."
            : "The code prevents someone else from using your email."}
        </p>
      )}
    </div>
  );
}
