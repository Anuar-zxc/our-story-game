"use client";

import { useMemo, useState } from "react";
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

type HistoryItem = {
  choiceText: string;
};

const statsOrder: PixelStat[] = ["trust", "spark", "truth", "distance", "chaos"];

export default function Home() {
  const language = useGameStore((state) => state.language);
  const setLanguage = useGameStore((state) => state.setLanguage);
  const isRu = language === "ru";
  const [nodeId, setNodeId] = useState("start");
  const [stats, setStats] = useState(initialPixelStats);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [flags, setFlags] = useState<string[]>([]);
  const node = pixelNodes[nodeId];
  const endingGrade = useMemo(() => getEndingGrade(stats), [stats]);

  const choose = (choice: PixelChoice) => {
    const nextStats = { ...stats };
    for (const [key, value] of Object.entries(choice.delta) as Array<[PixelStat, number]>) {
      nextStats[key] = clampStat(nextStats[key] + value);
    }
    setStats(nextStats);
    setHistory((items) => [
      ...items,
      {
        choiceText: isRu ? choice.textRu : choice.textEn,
      },
    ]);
    if (choice.flag) setFlags((items) => [...items, choice.flag as string]);
    setNodeId(choice.next);
  };

  const restart = () => {
    setNodeId("start");
    setStats(initialPixelStats);
    setHistory([]);
    setFlags([]);
  };

  return (
    <main className={`pixel-game pixel-mood-${node.mood}`}>
      <div className="pixel-scanlines" />
      <div className="pixel-stars" />

      <section className="pixel-shell">
        <header className="pixel-topbar">
          <div>
            <p className="pixel-kicker">{isRu ? "мобильная visual novel" : "mobile visual novel"}</p>
            <h1>Our Story: Pixel Hearts</h1>
          </div>
          <button
            className="pixel-lang"
            type="button"
            onClick={() => setLanguage(isRu ? "en" : "ru")}
            aria-label={isRu ? "Switch to English" : "Переключить на русский"}
          >
            {isRu ? "RU" : "EN"}
          </button>
        </header>

        <div className="pixel-stage">
          <div className="pixel-scene-card">
            <div className="pixel-scene-top">
              <span>{node.act}</span>
              <span>{isRu ? node.sceneRu : node.sceneEn}</span>
            </div>
            <PixelCharacter mood={node.mood} />
            <div className="pixel-ground">
              <span />
              <span />
              <span />
            </div>
          </div>

          <aside className="pixel-side-panel">
            <p className="pixel-panel-title">{isRu ? "состояние связи" : "bond state"}</p>
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
          </aside>
        </div>

        <section className="pixel-dialogue">
          <div className="pixel-nameplate">{isRu ? node.speakerRu : node.speakerEn}</div>
          <p>{isRu ? node.lineRu : node.lineEn}</p>
        </section>

        {node.choices.length > 0 ? (
          <section className="pixel-choices" aria-label={isRu ? "Выборы" : "Choices"}>
            {node.choices.map((choice) => (
              <button key={choice.id} type="button" onClick={() => choose(choice)} className="pixel-choice">
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
                  .map((item, index) => `${index + 1}. ${item.choiceText}`)
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
