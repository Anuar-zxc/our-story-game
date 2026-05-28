"use client";

import { useEffect, useMemo, useState } from "react";
import {
  clampNovelStat,
  getNovelEnding,
  novelInitialStats,
  novelScenes,
  novelStatLabels,
  type NovelChoice,
  type NovelStat,
} from "@/lib/darkNovel";
import { playPixelTone, startPixelAmbience, stopPixelAmbience } from "@/lib/pixelAudio";
import { useGameStore } from "@/store/gameStore";

type LogItem = {
  place: string;
  choice: string;
};

const statOrder: NovelStat[] = ["bravery", "doubt", "tenderness", "obsession"];

export default function Home() {
  const language = useGameStore((state) => state.language);
  const setLanguage = useGameStore((state) => state.setLanguage);
  const isRu = language === "ru";
  const [sceneId, setSceneId] = useState("start");
  const [stats, setStats] = useState(novelInitialStats);
  const [flags, setFlags] = useState<string[]>([]);
  const [log, setLog] = useState<LogItem[]>([]);
  const [soundOn, setSoundOn] = useState(false);
  const [showDiary, setShowDiary] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const scene = novelScenes[sceneId];
  const route = useMemo(() => getNovelEnding(stats), [stats]);
  const progress = Math.min(100, Math.round(((log.length + 1) / 8) * 100));

  useEffect(() => {
    if (!soundOn) {
      stopPixelAmbience();
      return;
    }

    startPixelAmbience(scene.tone);
    return () => stopPixelAmbience();
  }, [scene.tone, soundOn]);

  const choose = (choice: NovelChoice) => {
    if (transitioning) return;
    playPixelTone(choice.next.includes("ending") ? "ending" : scene.tone === "nightmare" ? "bad" : "choice");

    const nextStats = { ...stats };
    for (const [key, value] of Object.entries(choice.delta) as Array<[NovelStat, number]>) {
      nextStats[key] = clampNovelStat(nextStats[key] + value);
    }

    setStats(nextStats);
    setLog((items) => [
      ...items,
      {
        place: isRu ? scene.placeRu : scene.placeEn,
        choice: isRu ? choice.ru : choice.en,
      },
    ]);
    if (choice.flag) setFlags((items) => [...items, choice.flag as string]);
    setTransitioning(true);
    window.setTimeout(() => {
      setSceneId(choice.next);
      setTransitioning(false);
    }, 260);
  };

  const restart = () => {
    playPixelTone("confirm");
    setSceneId("start");
    setStats(novelInitialStats);
    setFlags([]);
    setLog([]);
    setTransitioning(false);
  };

  return (
    <main
      className={`bunny-novel bunny-${scene.backdrop} bunny-tone-${scene.tone} ${
        transitioning ? "bunny-cut" : ""
      }`}
    >
      <div className="bunny-noise" />
      <div className="bunny-snow" />

      <header className="bunny-top">
        <div className="bunny-brand">
          <span />
          <div>
            <p>{isRu ? "темная визуальная новелла" : "dark visual novel"}</p>
            <h1>{isRu ? "Черный снег" : "Black Snow"}</h1>
          </div>
        </div>
        <div className="bunny-actions">
          <button
            type="button"
            onClick={() => {
              playPixelTone("confirm");
              setSoundOn((value) => !value);
            }}
          >
            {soundOn ? "SFX" : "OFF"}
          </button>
          <button type="button" onClick={() => setLanguage(isRu ? "en" : "ru")}>
            {isRu ? "RU" : "EN"}
          </button>
          <button type="button" onClick={() => setShowDiary((value) => !value)}>
            {isRu ? "Дневник" : "Diary"}
          </button>
        </div>
      </header>

      <section className="bunny-stage" aria-label={isRu ? "Сцена" : "Scene"}>
        <div className="bunny-moon" />
        <div className="bunny-forest-line">
          {Array.from({ length: 18 }, (_, index) => (
            <span key={index} style={{ "--i": index } as React.CSSProperties} />
          ))}
        </div>
        <div className="bunny-houses">
          <span />
          <span />
          <span />
        </div>
        <div className="bunny-road" />
        <div className="bunny-lake-surface" />
        <div className="bunny-window" />
        <div className="bunny-bus-stop" />
        <div className="bunny-school" />
        <div className="bunny-dream-eyes">
          <span />
          <span />
          <span />
        </div>

        {scene.portrait !== "none" ? (
          <div className={`bunny-portrait bunny-portrait-${scene.portrait}`}>
            <div className="bunny-hair" />
            <div className="bunny-face">
              <span className="bunny-eye bunny-eye-left" />
              <span className="bunny-eye bunny-eye-right" />
              <span className="bunny-mouth" />
            </div>
            <div className="bunny-body" />
            <div className="bunny-ribbon" />
          </div>
        ) : null}
      </section>

      <div className="bunny-progress" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>

      {scene.choices.length > 0 ? (
        <section className="bunny-choices" aria-label={isRu ? "Выборы" : "Choices"}>
          {scene.choices.map((choice) => (
            <button key={choice.id} type="button" onClick={() => choose(choice)}>
              <span>{isRu ? choice.ru : choice.en}</span>
              <i>{formatDelta(choice.delta, isRu)}</i>
            </button>
          ))}
        </section>
      ) : (
        <section className="bunny-ending">
          <p>{isRu ? "Маршрут завершен" : "Route complete"}</p>
          <h2>{route}</h2>
          <button type="button" onClick={restart}>
            {isRu ? "Начать заново" : "Restart"}
          </button>
        </section>
      )}

      <section className="bunny-dialogue">
        <div className="bunny-meta">
          <span>{scene.chapter}</span>
          <span>{isRu ? scene.placeRu : scene.placeEn}</span>
        </div>
        <h2>{isRu ? scene.speakerRu : scene.speakerEn}</h2>
        <p>{isRu ? scene.textRu : scene.textEn}</p>
      </section>

      <aside className={`bunny-diary ${showDiary ? "open" : ""}`}>
        <div className="bunny-diary-head">
          <div>
            <p>{isRu ? "маршрут" : "route"}</p>
            <h2>{route}</h2>
          </div>
          <button type="button" onClick={() => setShowDiary(false)}>
            {isRu ? "Закрыть" : "Close"}
          </button>
        </div>
        <div className="bunny-stat-list">
          {statOrder.map((key) => (
            <div key={key} className="bunny-stat">
              <div>
                <span>{isRu ? novelStatLabels[key].ru : novelStatLabels[key].en}</span>
                <b>{stats[key]}</b>
              </div>
              <i>
                <span style={{ width: `${stats[key]}%` }} />
              </i>
            </div>
          ))}
        </div>
        <div className="bunny-log">
          <p>{isRu ? "последние решения" : "latest decisions"}</p>
          {log.length === 0 ? (
            <span>{isRu ? "Дневник пока пуст." : "The diary is empty."}</span>
          ) : (
            log.slice(-5).map((item, index) => (
              <span key={`${item.place}-${item.choice}`}>
                {index + 1}. {item.place}: {item.choice}
              </span>
            ))
          )}
        </div>
        <div className="bunny-flags">
          {flags.slice(-6).map((flag) => (
            <span key={flag}>{flag.replaceAll("_", " ")}</span>
          ))}
        </div>
      </aside>
    </main>
  );
}

function formatDelta(delta: Partial<Record<NovelStat, number>>, isRu: boolean) {
  return (Object.entries(delta) as Array<[NovelStat, number]>)
    .map(([key, value]) => {
      const label = isRu ? novelStatLabels[key].ru : novelStatLabels[key].en;
      return `${value > 0 ? "+" : ""}${value} ${label}`;
    })
    .join(" / ");
}
