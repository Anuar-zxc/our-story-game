import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getCurrentUser } from "@/lib/auth";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1";
const stageLabelMap: Record<string, { ru: string; en: string }> = {
  new_love: { ru: "что она думает обо мне", en: "what she thinks about me" },
  in_love: { ru: "идеальные отношения", en: "perfect relationship" },
  long_distance: { ru: "отношения на расстоянии", en: "long-distance relationship" },
  after_fight: { ru: "после ссоры", en: "after a fight" },
  almost_broken: { ru: "почти расстались", en: "almost broken up" },
};

// Questions bank per relationship stage (fallback if AI fails)
const fallbackQuestions: Record<string, { en: string[]; ru: string[] }> = {
  new_love: {
    en: [
      "What do you hope she notices in you when you are not trying?",
      "What are you afraid she might misunderstand about you?",
      "If she could read one quiet thought of yours, what would it be?",
      "What part of you becomes softer when you imagine her choosing you?",
      "What question about you do you secretly hope she asks first?",
      "What small sign would make you feel that she is thinking about you?",
    ],
    ru: [
      "Что ты надеешься, что она замечает в тебе, когда ты не стараешься?",
      "Что ты боишься, что она может неправильно понять в тебе?",
      "Если бы она могла прочитать одну твою тихую мысль, что бы это было?",
      "Какая часть тебя становится мягче, когда ты представляешь, что она выбирает тебя?",
      "Какой вопрос о себе ты тайно хочешь от неё услышать первым?",
      "Какой маленький знак дал бы тебе понять, что она думает о тебе?",
    ],
  },
  in_love: {
    en: [
      "What does an ideal relationship look like in the smallest daily details?",
      "What should never disappear between you, even years later?",
      "When do you feel your relationship is closest to perfect?",
      "What ordinary moment between you feels more romantic than a big gesture?",
      "What rule would you invent to protect the warmth between you?",
      "What do you want your partner to feel every time they come home to you?",
    ],
    ru: [
      "Как выглядят идеальные отношения в самых маленьких бытовых деталях?",
      "Что между вами не должно исчезнуть даже через годы?",
      "В какой момент ты чувствуешь, что ваши отношения ближе всего к идеальным?",
      "Какой обычный момент между вами романтичнее любого большого жеста?",
      "Какое правило ты бы придумал(а), чтобы беречь тепло между вами?",
      "Что ты хочешь, чтобы партнёр чувствовал каждый раз, возвращаясь к тебе?",
    ],
  },
  long_distance: {
    en: [
      "What do you miss most that can't be sent over a screen?",
      "What's the first thing you want to do when you're finally together?",
      "Describe a time the distance felt heaviest.",
      "What tiny ritual would make the distance feel less empty this week?",
      "What do you want them to know on the nights when you answer late?",
      "What promise feels realistic enough to keep from far away?",
    ],
    ru: [
      "Чего больше всего не хватает, что нельзя передать через экран?",
      "Что ты хочешь сделать в первую очередь, когда вы снова будете вместе?",
      "Опиши момент, когда расстояние ощущалось особенно тяжело.",
      "Какой маленький ритуал сделал бы расстояние менее пустым на этой неделе?",
      "Что ты хочешь, чтобы он(а) знал(а) в вечера, когда ты отвечаешь поздно?",
      "Какое обещание кажется достаточно реальным, чтобы держать его на расстоянии?",
    ],
  },
  after_fight: {
    en: [
      "What were you actually trying to say during the argument?",
      "What do you wish had been said differently?",
      "What's one thing you love about them that you forgot during the fight?",
      "What feeling was hiding underneath your sharpest words?",
      "What would a repair look like if nobody had to win?",
      "What soft thing do you still want to say, even after being hurt?",
    ],
    ru: [
      "Что ты на самом деле пытался(ась) сказать во время ссоры?",
      "Что ты хотел(а) бы сказать по-другому?",
      "Что ты любишь в нём/ней, о чём забыл(а) во время ссоры?",
      "Какое чувство пряталось под твоими самыми резкими словами?",
      "Как выглядело бы примирение, если никому не нужно победить?",
      "Что мягкое ты всё ещё хочешь сказать, даже после обиды?",
    ],
  },
  almost_broken: {
    en: [
      "What is the one memory that still makes you want to stay?",
      "What did you stop saying that you used to say all the time?",
      "If you could rewind to one moment, which would it be?",
      "What are you afraid would disappear if you really let go?",
      "What still feels unfinished between you?",
      "What would have to change for hope to feel honest again?",
    ],
    ru: [
      "Какое воспоминание всё ещё заставляет тебя остаться?",
      "Что ты перестал(а) говорить, хотя раньше говорил(а) постоянно?",
      "Если бы ты мог(ла) вернуться к одному моменту — к какому?",
      "Что, как тебе страшно, исчезнет, если ты правда отпустишь?",
      "Что между вами всё ещё ощущается незавершённым?",
      "Что должно измениться, чтобы надежда снова была честной?",
    ],
  },
};

function randomThree(items: string[]) {
  return items
    .map((item) => ({ item, order: crypto.randomInt(0, 1_000_000) }))
    .sort((a, b) => a.order - b.order)
    .slice(0, 3)
    .map(({ item }) => item);
}

async function callDeepSeek(messages: { role: string; content: string }[]) {
  const res = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages,
      temperature: 1.15,
      presence_penalty: 0.7,
      frequency_penalty: 0.45,
      max_tokens: 600,
    }),
  });
  if (!res.ok) throw new Error(`DeepSeek API error: ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content as string;
}

function cleanJson(raw: string) {
  return raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
}

function answerWords(value: unknown) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3);
}

function calculateSimilarity(p1Answers: Record<string, unknown>, p2Answers: Record<string, unknown>) {
  const a = new Set(Object.values(p1Answers ?? {}).flatMap(answerWords));
  const b = new Set(Object.values(p2Answers ?? {}).flatMap(answerWords));
  if (!a.size || !b.size) return 52;
  const shared = [...a].filter((word) => b.has(word)).length;
  const union = new Set([...a, ...b]).size;
  return Math.max(38, Math.min(96, Math.round(44 + (shared / union) * 120)));
}

function fallbackReveal({
  language,
  name1,
  name2,
  p1Answers,
  p2Answers,
}: {
  language: string;
  name1: string;
  name2: string;
  p1Answers: Record<string, unknown>;
  p2Answers: Record<string, unknown>;
}) {
  const similarity = calculateSimilarity(p1Answers, p2Answers);
  if (language === "ru") {
    return {
      similarity,
      insight: `${name1} и ${name2} отвечают по-разному, но оба пытаются добраться до одного и того же: быть понятыми без лишней защиты.`,
      sharedTheme: "Вы оба ищете не идеальные слова, а ощущение, что рядом можно быть настоящими.",
      difference: "Один больше говорит через действие, другой через чувство. Это не конфликт, а разные языки близости.",
      hiddenPattern: "В ваших ответах есть тихая просьба: замечай меня даже тогда, когда я не говорю напрямую.",
      nextTask: "Сегодня отправьте друг другу одно голосовое на 30 секунд: без объяснений, просто что вы сейчас чувствуете.",
    };
  }
  return {
    similarity,
    insight: `${name1} and ${name2} answer differently, but both are reaching for the same thing: to be understood without armor.`,
    sharedTheme: "You are both looking less for perfect words and more for permission to be real.",
    difference: "One speaks through action, the other through feeling. That is not a conflict; it is two languages of closeness.",
    hiddenPattern: "Your answers carry a quiet request: notice me even when I do not say it directly.",
    nextTask: "Today, send each other one 30-second voice note: no explanations, just what you feel right now.",
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, p1Answers, p2Answers, stage, language, p1Name, p2Name, tone } = body;
    const currentUser = await getCurrentUser();
    const profileContext =
      currentUser
        ? language === "ru"
          ? `Контекст пары из профиля: ${currentUser.name}${currentUser.zodiac ? ` (${currentUser.zodiac})` : ""} и ${currentUser.partner_name ?? "партнер"}${currentUser.partner_zodiac ? ` (${currentUser.partner_zodiac})` : ""}. ${currentUser.anniversary ? `Дата/годовщина: ${currentUser.anniversary}.` : ""} ${currentUser.love_language ? `Язык любви: ${currentUser.love_language}.` : ""} ${currentUser.relationship_note ? `Заметка: ${currentUser.relationship_note}.` : ""}`
          : `Couple profile context: ${currentUser.name}${currentUser.zodiac ? ` (${currentUser.zodiac})` : ""} and ${currentUser.partner_name ?? "partner"}${currentUser.partner_zodiac ? ` (${currentUser.partner_zodiac})` : ""}. ${currentUser.anniversary ? `Date/anniversary: ${currentUser.anniversary}.` : ""} ${currentUser.love_language ? `Love language: ${currentUser.love_language}.` : ""} ${currentUser.relationship_note ? `Note: ${currentUser.relationship_note}.` : ""}`
        : "";

    // ── 1. Generate Questions ──
    if (action === "questions") {
      const fallback = fallbackQuestions[stage] ?? fallbackQuestions["in_love"];
      const questions = randomThree(fallback[language === "ru" ? "ru" : "en"]);

      if (!DEEPSEEK_API_KEY || DEEPSEEK_API_KEY === "your_deepseek_api_key_here") {
        return NextResponse.json({ questions });
      }

      const stageLabel = stageLabelMap[stage]?.[language === "ru" ? "ru" : "en"] ?? stage;
      const toneLabelMap: Record<string, { ru: string; en: string }> = {
        tender: { ru: "нежный", en: "tender" },
        honest: { ru: "честный и прямой", en: "honest and direct" },
        funny: { ru: "смешной, но не поверхностный", en: "funny but not shallow" },
        deep: { ru: "глубокий и кинематографичный", en: "deep and cinematic" },
      };
      const toneLabel = toneLabelMap[tone]?.[language === "ru" ? "ru" : "en"] ?? toneLabelMap.tender[language === "ru" ? "ru" : "en"];
      const freshSeed = crypto.randomBytes(8).toString("hex");

      const systemPrompt =
        language === "ru"
          ? `Ты — поэтичный, чуткий помощник для пар. Генерируй 3 коротких, глубоких, эмоциональных вопроса для пары на этапе "${stageLabel}". 
Тон вопросов: ${toneLabel}. ${profileContext} Вопросы должны быть личными, кинематографичными, без клише. Не повторяй банальные формулировки и не повторяй вопросы из прошлых раундов. Сид свежести: ${freshSeed}. Без нумерации. Выведи только 3 вопроса, каждый на отдельной строке.`
          : `You are a poetic, emotionally-intelligent assistant for couples. Generate 3 short, deep, emotionally resonant questions for a couple in the "${stageLabel}" phase.
Question tone: ${toneLabel}. ${profileContext} Questions must be personal, cinematic, non-cliché. Do not repeat generic phrasing or prior-round questions. Freshness seed: ${freshSeed}. No numbering. Output only 3 questions, one per line.`;

      try {
        const raw = await callDeepSeek([{ role: "user", content: systemPrompt }]);
        const aiQuestions = raw.split("\n").filter((l) => l.trim()).slice(0, 3);
        if (aiQuestions.length === 3) {
          return NextResponse.json({ questions: aiQuestions });
        }
      } catch {
        // fall through to fallback
      }

      return NextResponse.json({ questions });
    }

    // ── 2. Generate Insight from Answers ──
    if (action === "insight") {
      const name1 = p1Name || "Player 1";
      const name2 = p2Name || "Player 2";
      const fallback = fallbackReveal({ language, name1, name2, p1Answers, p2Answers });

      if (!DEEPSEEK_API_KEY || DEEPSEEK_API_KEY === "your_deepseek_api_key_here") {
        return NextResponse.json(fallback);
      }

      const stageLabel = stageLabelMap[stage]?.[language === "ru" ? "ru" : "en"] ?? stage;
      const prompt =
        language === "ru"
          ? `Ты — game designer и чуткий психолог для игры пары. Проанализируй ответы двух людей на этапе "${stageLabel}".
${profileContext}
Верни строго JSON без markdown с полями:
similarity: число 0-100, честная оценка близости ответов;
insight: 2 коротких кинематографичных предложения;
sharedTheme: что у них совпало;
difference: где они разошлись;
hiddenPattern: скрытая тема или просьба между строк;
nextTask: одно маленькое совместное задание на сегодня.
Не используй клише, морализаторство и терапевтические советы.

${name1} написал(а):
«${p1Answers?.q1 || ""}»
«${p1Answers?.q2 || ""}»
«${p1Answers?.q3 || ""}»

${name2} написал(а):
«${p2Answers?.q1 || ""}»
«${p2Answers?.q2 || ""}»
«${p2Answers?.q3 || ""}»`
          : `You are a game designer and emotionally intelligent relationship observer for a two-person game. Analyze two people's answers in the "${stageLabel}" scenario.
${profileContext}
Return strict JSON without markdown with:
similarity: number 0-100, honest closeness of answers;
insight: 2 short cinematic sentences;
sharedTheme: what matched;
difference: where they diverged;
hiddenPattern: the hidden theme or request between the lines;
nextTask: one tiny shared task for today.
No clichés, moralizing, or therapy advice.

${name1} wrote:
"${p1Answers?.q1 || ""}"
"${p1Answers?.q2 || ""}"
"${p1Answers?.q3 || ""}"

${name2} wrote:
"${p2Answers?.q1 || ""}"
"${p2Answers?.q2 || ""}"
"${p2Answers?.q3 || ""}"`;

      try {
        const raw = await callDeepSeek([{ role: "user", content: prompt }]);
        const parsed = JSON.parse(cleanJson(raw));
        return NextResponse.json({
          similarity: Number(parsed.similarity) || fallback.similarity,
          insight: String(parsed.insight || fallback.insight),
          sharedTheme: String(parsed.sharedTheme || fallback.sharedTheme),
          difference: String(parsed.difference || fallback.difference),
          hiddenPattern: String(parsed.hiddenPattern || fallback.hiddenPattern),
          nextTask: String(parsed.nextTask || fallback.nextTask),
        });
      } catch {
        return NextResponse.json(fallback);
      }
    }

    // ── 3. Generate Final Story ──
    if (action === "story") {
      const name1 = p1Name || "Player 1";
      const name2 = p2Name || "Player 2";

      const fallbackStory =
        language === "ru"
          ? `Это история ${name1} и ${name2}. Вы начали как два разных пути, хранящих разные воспоминания. Готовя вместе, деля тишину и находя путь через несказанные слова, вы доказали: любовь — не идеальная память. Это выбор — создавать следующее воспоминание вместе.`
          : `This is the story of ${name1} and ${name2}. Two paths, carrying different memories of the same moments. Through shared silences and unspoken words, you proved that love isn't about remembering everything perfectly — it's about choosing to build the next memory, together.`;

      if (!DEEPSEEK_API_KEY || DEEPSEEK_API_KEY === "your_deepseek_api_key_here") {
        return NextResponse.json({ story: fallbackStory });
      }

      const prompt =
        language === "ru"
          ? `Напиши финальную историю отношений ${name1} и ${name2} в 3–4 кинематографичных предложениях. Поэтично, тепло, без сентиментальности. Как закадровый голос в красивом фильме.`
          : `Write a final relationship story for ${name1} and ${name2} in 3–4 cinematic sentences. Poetic, warm, not sentimental. Like a voiceover in a beautiful film.`;

      try {
        const story = await callDeepSeek([{ role: "user", content: prompt }]);
        return NextResponse.json({ story: story.trim() });
      } catch {
        return NextResponse.json({ story: fallbackStory });
      }
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("AI route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
