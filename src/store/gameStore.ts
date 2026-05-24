import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import en from '@/locales/en.json';
import ru from '@/locales/ru.json';

export type Language = 'en' | 'ru';

export type GamePhase = 'landing' | 'setup' | 'memory' | 'game' | 'factory' | 'list' | 'summary';

export interface PlayerAnswers {
  q1: string;
  q2: string;
  q3: string;
}

export interface RevealData {
  similarity: number;
  insight: string;
  sharedTheme: string;
  difference: string;
  hiddenPattern: string;
  nextTask: string;
}

export interface StoryChapter {
  id: string;
  createdAt: string;
  stage: string;
  player1Name: string;
  player2Name: string;
  reveal: RevealData;
}

export interface GameState {
  language: Language;
  phase: GamePhase;
  player1Name: string;
  player2Name: string;
  relationshipStage: string;
  questionTone: string;
  p1Answers: PlayerAnswers;
  p2Answers: PlayerAnswers;
  lastReveal: RevealData | null;
  chapters: StoryChapter[];
  loveFactoryProgress: number; // 0 to 14
  loveListProgress: number[]; // Array of completed item IDs

  setLanguage: (lang: Language) => void;
  setPhase: (phase: GamePhase) => void;
  setPlayers: (p1: string, p2: string) => void;
  setRelationshipStage: (stage: string) => void;
  setQuestionTone: (tone: string) => void;
  setP1Answers: (answers: Partial<PlayerAnswers>) => void;
  setP2Answers: (answers: Partial<PlayerAnswers>) => void;
  setLastReveal: (reveal: RevealData) => void;
  addChapter: (chapter: Omit<StoryChapter, 'id' | 'createdAt'>) => void;
  setLoveFactoryProgress: (level: number) => void;
  toggleLoveListItem: (id: number) => void;
  resetGame: () => void;
}

const initialState = {
  language: 'en' as Language,
  phase: 'landing' as GamePhase,
  player1Name: '',
  player2Name: '',
  relationshipStage: 'new_love',
  questionTone: 'tender',
  p1Answers: { q1: '', q2: '', q3: '' },
  p2Answers: { q1: '', q2: '', q3: '' },
  lastReveal: null,
  chapters: [],
  loveFactoryProgress: 0,
  loveListProgress: [],
};

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      ...initialState,
      setLanguage: (lang) => set({ language: lang }),
      setPhase: (phase) => set({ phase }),
      setPlayers: (p1, p2) => set({ player1Name: p1, player2Name: p2 }),
      setRelationshipStage: (stage) => set({ relationshipStage: stage }),
      setQuestionTone: (tone) => set({ questionTone: tone }),
      setP1Answers: (answers) =>
        set((state) => ({ p1Answers: { ...state.p1Answers, ...answers } })),
      setP2Answers: (answers) =>
        set((state) => ({ p2Answers: { ...state.p2Answers, ...answers } })),
      setLastReveal: (reveal) => set({ lastReveal: reveal }),
      addChapter: (chapter) =>
        set((state) => ({
          chapters: [
            {
              ...chapter,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
            },
            ...state.chapters,
          ],
        })),
      setLoveFactoryProgress: (level) => set({ loveFactoryProgress: level }),
      toggleLoveListItem: (id) =>
        set((state) => {
          const current = state.loveListProgress;
          if (current.includes(id)) {
            return { loveListProgress: current.filter((item) => item !== id) };
          } else {
            return { loveListProgress: [...current, id] };
          }
        }),
      resetGame: () => set(initialState),
    }),
    {
      name: 'after-us-storage',
    }
  )
);

// i18n Helper
export function useTranslation() {
  const { language } = useGameStore();
  const t = language === 'en' ? en : ru;

  return { t, language };
}
