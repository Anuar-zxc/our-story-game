"use client";

import { useEffect, useMemo, useState } from "react";
import {
  clampStat,
  getEndingGrade,
  initialPixelStats,
  pixelNodes,
  pixelStatLabels,
  type PixelChoice,
  type PixelStat,
} from "@/lib/pixelStory";
import { PixelCharacter } from "@/components/PixelCharacter";
import { useGameStore } from "@/store/gameStore";
import { playPixelTone, startPixelAmbience, stopPixelAmbience } from "@/lib/pixelAudio";

type HistoryItem = {
  choiceText: string;
  scene: string;
};

const statsOrder: PixelStat[] = ["trust", "spark", "truth", "distance", "chaos"];
const maxBranches = 6;

export default function Home() {
  const language = useGameStore((state) => state.language);
  const setLanguage = useGameStore((state) => state.setLanguage);
  const isRu = language === "ru";
  const [nodeId, setNodeId] = useState("start");
  const [stats, setStats] = useState(initialPixelStats);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [flags, setFlags] = useState<string[]>([]);
  const [soundOn, setSoundOn] = useState(false);
  const [flash, setFlash] = useState(false);
  const node = pixelNodes[nodeId];
  const endingGrade = useMemo(() => getEndingGrade(stats), [stats]);
  const sceneKind = getSceneKind(nodeId);
  const expression = getExpression(nodeId, node.mood);
  const progress = Math.min(100, Math.round((history.length / maxBranches) * 100));

  useEffect(() => {
    if (!soundOn) {
      stopPixelAmbience();
      return;
    }
    startPixelAmbience(node.mood);
    return () => stopPixelAmbience();
  }, [node.mood, soundOn]);

  const choose = (choice: PixelChoice) => {
    playPixelTone(choice.next.includes("bad") ? "bad" : choice.next.includes("ending") ? "ending" : "choice");
    const nextStats = { ...stats };
    for (const [key, value] of Object.entries(choice.delta) as Array<[PixelStat, number]>) {
      nextStats[key] = clampStat(nextStats[key] + value);
    }
    setStats(nextStats);
    setHistory((items) => [
      ...items,
      {
        choiceText: isRu ? choice.textRu : choice.textEn,
        scene: isRu ? node.sceneRu : node.sceneEn,
      },
    ]);
    if (choice.flag) setFlags((items) => [...items, choice.flag as string]);
    setFlash(true);
    setNodeId(choice.next);
    window.setTimeout(() => setFlash(false), 360);
  };

  const restart = () => {
    playPixelTone("confirm");
    setNodeId("start");
    setStats(initialPixelStats);
    setHistory([]);
    setFlags([]);
  };

  return (
    <main className={`pixel-game pixel-mood-${node.mood} ${flash ? "pixel-flash" : ""}`}>
      <div className="pixel-scanlines" />
      <div className="pixel-stars" />

      <section className="pixel-shell">
        <header className="pixel-topbar">
          <div>
            <p className="pixel-kicker">{isRu ? "мобильная visual novel" : "mobile visual novel"}</p>
            <h1>Our Story: Pixel Hearts</h1>
          </div>
          <div className="pixel-top-actions">
            <button
              className="pixel-lang"
              type="button"
              onClick={() => {
                playPixelTone("confirm");
                setSoundOn((value) => !value);
              }}
              aria-label={isRu ? "Звук" : "Sound"}
            >
              {soundOn ? "SFX" : "OFF"}
            </button>
            <button
              className="pixel-lang"
              type="button"
              onClick={() => setLanguage(isRu ? "en" : "ru")}
              aria-label={isRu ? "Switch to English" : "Переключить на русский"}
            >
              {isRu ? "RU" : "EN"}
            </button>
          </div>
        </header>

        <div className="pixel-progress-shell">
          <span style={{ width: `${progress}%` }} />
          <b>{isRu ? `Глава ${Math.min(history.length + 1, maxBranches)}/${maxBranches}` : `Chapter ${Math.min(history.length + 1, maxBranches)}/${maxBranches}`}</b>
        </div>

        <div className="pixel-stage">
          <div className={`pixel-scene-card pixel-scene-${sceneKind}`}>
            <div className="pixel-scene-top">
              <span>{node.act}</span>
              <span>{isRu ? node.sceneRu : node.sceneEn}</span>
            </div>
            <PixelCharacter mood={node.mood} expression={expression} />
            <PixelCharacter mood={node.mood} expression="neutral" side="player" />
            <div className="pixel-rain" />
            <div className="pixel-neon-sign">{getSceneSign(sceneKind)}</div>
            <div className="pixel-ground">
              <span />
              <span />
              <span />
            </div>
          </div>

          <aside className="pixel-side-panel">
            <p className="pixel-panel-title">{isRu ? "состояние связи" : "bond state"}</p>
            <div className="pixel-route-card">
              <span>{isRu ? "маршрут" : "route"}</span>
              <b>{getRouteName(flags, isRu)}</b>
            </div>
            <div className="pixel-stat-grid">
              {statsOrder.map((key) => (
                <div key={key} className="pixel-stat">
                  <div className="pixel-stat-row">
                    <span>{isRu ? pixelStatLabels[key].ru : pixelStatLabels[key].en}</span>
                    <b>{stats[key]}</b>
                  </div>
                  <div className="pixel-stat-track">
                    <span style={{ width: `${stats[key]}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="pixel-grade">
              <span>{isRu ? "прогноз концовки" : "ending forecast"}</span>
              <b>{endingGrade}</b>
            </div>
            <div className="pixel-memory-chips">
              {flags.slice(-4).map((flag) => (
                <span key={flag}>{flag.replaceAll("_", " ")}</span>
              ))}
            </div>
          </aside>
        </div>

        <section key={node.id} className="pixel-dialogue">
          <div className="pixel-nameplate">{isRu ? node.speakerRu : node.speakerEn}</div>
          <p>{isRu ? node.lineRu : node.lineEn}</p>
        </section>

        {node.choices.length > 0 ? (
          <section className="pixel-choices" aria-label={isRu ? "Выборы" : "Choices"}>
            {node.choices.map((choice) => (
              <button
                key={choice.id}
                type="button"
                onPointerUp={() => choose(choice)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") choose(choice);
                }}
                className="pixel-choice"
              >
                <span>{isRu ? choice.textRu : choice.textEn}</span>
                <i>{formatDelta(choice.delta, isRu)}</i>
              </button>
            ))}
          </section>
        ) : (
          <section className="pixel-ending">
            <div>
              <p className="pixel-kicker">{isRu ? "результат прохождения" : "run result"}</p>
              <h2>{isRu ? `Ранг ${endingGrade}` : `Rank ${endingGrade}`}</h2>
              <p>
                {isRu
                  ? `Ты открыл ${history.length} развилок и собрал ${new Set(flags).size} сюжетных флагов.`
                  : `You opened ${history.length} branches and collected ${new Set(flags).size} story flags.`}
              </p>
            </div>
            <button type="button" onClick={restart} className="pixel-primary">
              {isRu ? "Начать новый маршрут" : "Start a new route"}
            </button>
          </section>
        )}

        <footer className="pixel-log">
          <p>{isRu ? "журнал маршрута" : "route log"}</p>
          <div>
            {history.length === 0
              ? isRu
                ? "Первый выбор еще впереди."
                : "Your first choice is waiting."
              : history
                  .slice(-4)
                  .map((item, index) => `${index + 1}. ${item.scene}: ${item.choiceText}`)
                  .join(" / ")}
          </div>
        </footer>
      </section>
    </main>
  );
}

function formatDelta(delta: Partial<Record<PixelStat, number>>, isRu: boolean) {
  const items = Object.entries(delta) as Array<[PixelStat, number]>;
  return items
    .map(([key, value]) => {
      const label = isRu ? pixelStatLabels[key].ru : pixelStatLabels[key].en;
      return `${value > 0 ? "+" : ""}${value} ${label}`;
    })
    .join("  ");
}

function getSceneKind(nodeId: string) {
  if (nodeId.includes("arcade") || nodeId.includes("boss")) return "arcade";
  if (nodeId.includes("station") || nodeId.includes("train")) return "station";
  if (nodeId.includes("rain")) return "rain";
  if (nodeId.includes("market")) return "market";
  if (nodeId.includes("bridge") || nodeId.includes("ending")) return "bridge";
  if (nodeId.includes("truth") || nodeId.includes("mirror") || nodeId.includes("bad")) return "glitch";
  return "roof";
}

function getSceneSign(sceneKind: string) {
  const signs: Record<string, string> = {
    roof: "00:17",
    arcade: "LOVE.EXE",
    station: "LAST TRAIN",
    rain: "VOICE 03",
    market: "MEMORY SHOP",
    bridge: "SAVE?",
    glitch: "ERROR",
  };
  return signs[sceneKind] ?? "LOVE.EXE";
}

function getExpression(nodeId: string, mood: string): "neutral" | "soft" | "hurt" | "smile" | "shock" {
  if (nodeId.includes("bad") || mood === "danger") return "hurt";
  if (nodeId.includes("joke") || nodeId.includes("boss") || nodeId.includes("good")) return "smile";
  if (nodeId.includes("truth") || nodeId.includes("mirror") || mood === "glitch") return "shock";
  if (nodeId.includes("ending") || nodeId.includes("bridge") || mood === "soft") return "soft";
  return "neutral";
}

function getRouteName(flags: string[], isRu: boolean) {
  if (flags.includes("set_boundary") || flags.includes("mutual_admit")) return isRu ? "честный режим" : "honest mode";
  if (flags.includes("joke_armor") || flags.includes("stole_memory")) return isRu ? "глитч-маршрут" : "glitch route";
  if (flags.includes("chose_memory") || flags.includes("new_photo")) return isRu ? "маршрут памяти" : "memory route";
  if (flags.includes("gentle_home")) return isRu ? "тихий свет" : "quiet light";
  if (flags.includes("coop_route") || flags.includes("made_her_laugh")) return isRu ? "кооператив" : "co-op";
  return isRu ? "неизвестная ветка" : "unknown branch";
}
