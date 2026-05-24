"use client";

import { useEffect, useState } from "react";
import { LogOut, Mail, Save, UserRound } from "lucide-react";
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
  const [form, setForm] = useState({
    email: "",
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

  const submit = async () => {
    setSaving(true);
    const res = await fetch("/api/auth/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.user) {
      setUser(data.user);
      setPlayers(form.name, form.partnerName);
    }
    setSaving(false);
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
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
            {user ? (isRu ? "Прогресс сохраняется" : "Progress is saved") : isRu ? "Сохранить через email" : "Save with email"}
          </h2>
        </div>
      </div>

      <div className="grid gap-3">
        <input className="rounded-2xl border border-[#2c2010]/10 bg-[#fff8e8] px-4 py-3 outline-none" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
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
      </div>

      <button
        onClick={submit}
        disabled={saving || !form.email || !form.name || !form.partnerName}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-[24px] bg-[#2c2010] px-5 py-4 font-semibold text-white shadow-[0_16px_35px_rgba(44,32,16,0.22)] transition hover:-translate-y-0.5 disabled:opacity-50"
      >
        {user ? <Save size={18} /> : <Mail size={18} />}
        {saving ? (isRu ? "Сохраняем..." : "Saving...") : user ? (isRu ? "Обновить профиль" : "Update profile") : isRu ? "Создать профиль" : "Create profile"}
      </button>
    </div>
  );
}
