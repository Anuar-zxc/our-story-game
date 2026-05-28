export type PixelStat = "trust" | "spark" | "distance" | "truth" | "chaos";

export type PixelChoice = {
  id: string;
  textRu: string;
  textEn: string;
  next: string;
  delta: Partial<Record<PixelStat, number>>;
  flag?: string;
};

export type PixelNode = {
  id: string;
  act: string;
  speakerRu: string;
  speakerEn: string;
  lineRu: string;
  lineEn: string;
  sceneRu: string;
  sceneEn: string;
  mood: "soft" | "glitch" | "night" | "warm" | "danger";
  choices: PixelChoice[];
};

export const initialPixelStats: Record<PixelStat, number> = {
  trust: 45,
  spark: 50,
  distance: 40,
  truth: 35,
  chaos: 20,
};

export const pixelStatLabels: Record<PixelStat, { ru: string; en: string }> = {
  trust: { ru: "доверие", en: "trust" },
  spark: { ru: "искра", en: "spark" },
  distance: { ru: "дистанция", en: "distance" },
  truth: { ru: "правда", en: "truth" },
  chaos: { ru: "хаос", en: "chaos" },
};

export const pixelNodes: Record<string, PixelNode> = {
  start: {
    id: "start",
    act: "00:17",
    speakerRu: "Мио",
    speakerEn: "Mio",
    sceneRu: "Крыша школы после дождя",
    sceneEn: "School rooftop after rain",
    mood: "night",
    lineRu:
      "Телефон вибрирует в кармане. На экране одно сообщение: «Если ты правда помнишь, где мы начали, приходи на крышу». Мио стоит у перил и делает вид, что не ждала.",
    lineEn:
      "Your phone buzzes. One message: 'If you really remember where we began, come to the rooftop.' Mio stands by the railing, pretending she was not waiting.",
    choices: [
      {
        id: "honest",
        textRu: "Сказать: «Я пришел, потому что скучал»",
        textEn: "Say: 'I came because I missed you'",
        next: "roof_truth",
        delta: { trust: 12, truth: 14, distance: -8, spark: 4 },
        flag: "opened_first",
      },
      {
        id: "joke",
        textRu: "Пошутить, будто ты просто искал автомат с кофе",
        textEn: "Joke that you were only looking for a coffee machine",
        next: "roof_joke",
        delta: { spark: 12, chaos: 7, truth: -5 },
        flag: "hid_with_joke",
      },
      {
        id: "silent",
        textRu: "Молча встать рядом и смотреть на город",
        textEn: "Stand beside her silently and watch the city",
        next: "roof_silence",
        delta: { trust: 6, distance: 5, chaos: -4 },
        flag: "chose_silence",
      },
    ],
  },
  roof_truth: {
    id: "roof_truth",
    act: "00:22",
    speakerRu: "Мио",
    speakerEn: "Mio",
    sceneRu: "Капли на перилах светятся как пиксели",
    sceneEn: "Raindrops on the railing glow like pixels",
    mood: "soft",
    lineRu:
      "Она смотрит прямо, и это сложнее, чем любой бой. «Тогда скажи честно: ты скучал по мне или по версии нас, где мы еще ничего не сломали?»",
    lineEn:
      "She looks straight at you, harder than any boss fight. 'Then be honest: did you miss me, or the version of us where nothing was broken yet?'",
    choices: [
      {
        id: "miss_you",
        textRu: "«По тебе. Даже когда ты злишься»",
        textEn: "'You. Even when you are angry'",
        next: "station",
        delta: { trust: 14, truth: 8, spark: 6, distance: -10 },
        flag: "missed_real_mio",
      },
      {
        id: "miss_us",
        textRu: "«По нам. Я хочу вернуть тот уровень»",
        textEn: "'Us. I want that level back'",
        next: "arcade",
        delta: { spark: 8, trust: 3, distance: -4, chaos: 3 },
        flag: "nostalgia_route",
      },
      {
        id: "dont_know",
        textRu: "«Не знаю. Но я устал делать вид, что не важно»",
        textEn: "'I do not know. But I am tired of pretending it does not matter'",
        next: "rain_call",
        delta: { truth: 16, trust: 5, chaos: 6 },
        flag: "uncertain_truth",
      },
    ],
  },
  roof_joke: {
    id: "roof_joke",
    act: "00:21",
    speakerRu: "Мио",
    speakerEn: "Mio",
    sceneRu: "Старая вывеска мигает за домами",
    sceneEn: "An old sign flickers behind the buildings",
    mood: "glitch",
    lineRu:
      "Мио почти улыбается, но улыбка ломается на полпути. «Ты всегда прячешься за шуткой. Даже когда мне надо знать, что я тебе не все равно».",
    lineEn:
      "Mio almost smiles, but it breaks halfway. 'You always hide behind a joke. Even when I need to know I matter.'",
    choices: [
      {
        id: "drop_mask",
        textRu: "Снять маску и извиниться без оправданий",
        textEn: "Drop the mask and apologize without excuses",
        next: "station",
        delta: { trust: 12, truth: 12, chaos: -5, distance: -8 },
        flag: "apologized_clean",
      },
      {
        id: "double_joke",
        textRu: "Усилить шутку, чтобы не стало больно",
        textEn: "Double down on the joke so it hurts less",
        next: "glitch_market",
        delta: { chaos: 18, spark: 5, trust: -10, distance: 12 },
        flag: "joke_armor",
      },
      {
        id: "ask_second_chance",
        textRu: "Попросить один вечер без прошлых ошибок",
        textEn: "Ask for one evening without old mistakes",
        next: "arcade",
        delta: { trust: 7, spark: 10, distance: -5 },
        flag: "one_evening",
      },
    ],
  },
  roof_silence: {
    id: "roof_silence",
    act: "00:25",
    speakerRu: "Мио",
    speakerEn: "Mio",
    sceneRu: "Город шумит, будто старый картридж",
    sceneEn: "The city hums like an old cartridge",
    mood: "night",
    lineRu:
      "Молчание сначала теплое, потом становится слишком длинным. Мио шепчет: «Ты помнишь, что я просила тебя однажды не исчезать молча?»",
    lineEn:
      "The silence is warm at first, then too long. Mio whispers: 'Do you remember that I once asked you not to disappear quietly?'",
    choices: [
      {
        id: "promise_voice",
        textRu: "Пообещать говорить, даже когда страшно",
        textEn: "Promise to speak, even when afraid",
        next: "rain_call",
        delta: { trust: 11, truth: 10, distance: -7 },
        flag: "promised_voice",
      },
      {
        id: "hold_hand",
        textRu: "Взять ее за руку вместо ответа",
        textEn: "Hold her hand instead of answering",
        next: "station",
        delta: { spark: 13, trust: 5, truth: -3, distance: -6 },
        flag: "hand_route",
      },
      {
        id: "step_back",
        textRu: "Отступить: «Может, нам правда лучше разойтись»",
        textEn: "Step back: 'Maybe we really should leave each other'",
        next: "bad_signal",
        delta: { distance: 20, chaos: 10, trust: -12 },
        flag: "almost_left",
      },
    ],
  },
  station: {
    id: "station",
    act: "01:03",
    speakerRu: "Система",
    speakerEn: "System",
    sceneRu: "Ночная станция, последний поезд",
    sceneEn: "Night station, last train",
    mood: "warm",
    lineRu:
      "Вы спускаетесь к станции. Последний поезд уходит через три минуты. Мио достает два билета: один домой, второй туда, где вы впервые признались друг другу.",
    lineEn:
      "You reach the station. The last train leaves in three minutes. Mio holds two tickets: one home, one to the place where you first confessed.",
    choices: [
      {
        id: "old_place",
        textRu: "Поехать к месту первого признания",
        textEn: "Go to the place of the first confession",
        next: "confession_bridge",
        delta: { spark: 15, trust: 8, distance: -12 },
        flag: "chose_memory",
      },
      {
        id: "home",
        textRu: "Проводить ее домой и не давить",
        textEn: "Walk her home and do not push",
        next: "quiet_ending",
        delta: { trust: 16, chaos: -8, spark: -2 },
        flag: "gentle_home",
      },
      {
        id: "separate",
        textRu: "Сесть в разные вагоны и написать ей там",
        textEn: "Take separate cars and text her from there",
        next: "text_train",
        delta: { distance: 8, truth: 10, chaos: 4 },
        flag: "separate_cars",
      },
    ],
  },
  arcade: {
    id: "arcade",
    act: "01:11",
    speakerRu: "Мио",
    speakerEn: "Mio",
    sceneRu: "Закрытый аркадный зал",
    sceneEn: "Closed arcade hall",
    mood: "warm",
    lineRu:
      "Вы пролезаете в старый аркадный зал. Автомат Love.exe сам включается. На экране мигает: «Выберите режим: победить вместе или узнать правду».",
    lineEn:
      "You sneak into an old arcade. The Love.exe cabinet turns on by itself. The screen blinks: 'Choose mode: win together or learn the truth.'",
    choices: [
      {
        id: "coop",
        textRu: "Играть в кооператив и прикрывать ее ошибки",
        textEn: "Play co-op and cover her mistakes",
        next: "boss_fight",
        delta: { trust: 10, spark: 12, chaos: -3 },
        flag: "coop_route",
      },
      {
        id: "truth_mode",
        textRu: "Выбрать режим правды",
        textEn: "Choose truth mode",
        next: "truth_screen",
        delta: { truth: 18, chaos: 10, trust: -2 },
        flag: "truth_mode",
      },
      {
        id: "let_her_win",
        textRu: "Специально проиграть, чтобы она засмеялась",
        textEn: "Lose on purpose so she laughs",
        next: "boss_fight",
        delta: { spark: 18, trust: 4, truth: -4 },
        flag: "made_her_laugh",
      },
    ],
  },
  rain_call: {
    id: "rain_call",
    act: "01:26",
    speakerRu: "Мио",
    speakerEn: "Mio",
    sceneRu: "Автобусная остановка под ливнем",
    sceneEn: "Bus stop under heavy rain",
    mood: "soft",
    lineRu:
      "Дождь становится стеной. Мио протягивает тебе один наушник. В нем голосовое, которое она так и не отправила после вашей самой тяжелой ссоры.",
    lineEn:
      "Rain turns into a wall. Mio hands you one earbud. Inside is a voice note she never sent after your hardest fight.",
    choices: [
      {
        id: "listen_all",
        textRu: "Дослушать до конца, даже если больно",
        textEn: "Listen to the end, even if it hurts",
        next: "truth_screen",
        delta: { truth: 16, trust: 12, chaos: -4 },
        flag: "heard_voice",
      },
      {
        id: "pause",
        textRu: "Остановить запись и спросить ее живую",
        textEn: "Pause it and ask the living version of her",
        next: "confession_bridge",
        delta: { trust: 14, spark: 8, distance: -10 },
        flag: "chose_present",
      },
      {
        id: "run",
        textRu: "Испугаться и уйти под дождь",
        textEn: "Get scared and walk into the rain",
        next: "bad_signal",
        delta: { distance: 18, chaos: 14, trust: -14 },
        flag: "ran_from_voice",
      },
    ],
  },
  glitch_market: {
    id: "glitch_market",
    act: "02:02",
    speakerRu: "Система",
    speakerEn: "System",
    sceneRu: "Рынок воспоминаний, где продают чужие фразы",
    sceneEn: "Memory market where people sell old phrases",
    mood: "glitch",
    lineRu:
      "Твои шутки запускают сбой. Ларьки продают ваши старые сообщения. Самое дорогое: «Я не обиделась». Самое опасное: «Мне все равно».",
    lineEn:
      "Your jokes trigger a glitch. Stalls sell your old messages. Most expensive: 'I am not hurt.' Most dangerous: 'I do not care.'",
    choices: [
      {
        id: "buy_truth",
        textRu: "Купить правду, даже если она режет",
        textEn: "Buy the truth, even if it cuts",
        next: "truth_screen",
        delta: { truth: 20, trust: 4, chaos: -6 },
        flag: "bought_truth",
      },
      {
        id: "steal_memory",
        textRu: "Украсть воспоминание, где вы счастливы",
        textEn: "Steal a memory where you are happy",
        next: "boss_fight",
        delta: { spark: 11, chaos: 18, trust: -8 },
        flag: "stole_memory",
      },
      {
        id: "leave_market",
        textRu: "Выйти без покупок и признать: прошлого мало",
        textEn: "Leave empty-handed and admit the past is not enough",
        next: "confession_bridge",
        delta: { trust: 13, truth: 12, chaos: -10 },
        flag: "left_market",
      },
    ],
  },
  text_train: {
    id: "text_train",
    act: "02:18",
    speakerRu: "Чат",
    speakerEn: "Chat",
    sceneRu: "Два вагона, один туннель",
    sceneEn: "Two train cars, one tunnel",
    mood: "night",
    lineRu:
      "Связь пропадает между станциями. У тебя есть время отправить одно сообщение до туннеля. После него игра выберет ветку сама.",
    lineEn:
      "Signal dies between stations. You have time for one message before the tunnel. After that, the game chooses for you.",
    choices: [
      {
        id: "short_true",
        textRu: "«Я хочу научиться любить тебя взрослее»",
        textEn: "'I want to learn to love you more maturely'",
        next: "confession_bridge",
        delta: { trust: 15, truth: 12, distance: -9 },
        flag: "mature_love",
      },
      {
        id: "missed_call",
        textRu: "Позвонить вместо сообщения",
        textEn: "Call instead of texting",
        next: "rain_call",
        delta: { spark: 9, truth: 8, chaos: 8 },
        flag: "called_train",
      },
      {
        id: "delete",
        textRu: "Написать, стереть, ничего не отправить",
        textEn: "Write, delete, send nothing",
        next: "bad_signal",
        delta: { distance: 16, trust: -9, chaos: 6 },
        flag: "deleted_text",
      },
    ],
  },
  truth_screen: {
    id: "truth_screen",
    act: "03:03",
    speakerRu: "Love.exe",
    speakerEn: "Love.exe",
    sceneRu: "Экран правды",
    sceneEn: "Truth screen",
    mood: "danger",
    lineRu:
      "Автомат показывает две полоски здоровья. У Мио осталось мало терпения, у тебя слишком много гордости. Босс называется «Никто не виноват, но всем больно».",
    lineEn:
      "The cabinet shows two health bars. Mio has little patience left; you have too much pride. The boss is named 'Nobody is guilty, but everyone hurts.'",
    choices: [
      {
        id: "take_blame",
        textRu: "Взять свою часть вины без саморазрушения",
        textEn: "Take your part of the blame without self-destruction",
        next: "confession_bridge",
        delta: { trust: 18, truth: 15, chaos: -8, distance: -12 },
        flag: "owned_part",
      },
      {
        id: "ask_her",
        textRu: "Спросить, что она прятала от тебя",
        textEn: "Ask what she hid from you",
        next: "mirror_route",
        delta: { truth: 18, chaos: 12, trust: -2 },
        flag: "asked_hidden",
      },
      {
        id: "defend",
        textRu: "Защищаться: «Я тоже устал»",
        textEn: "Defend yourself: 'I am tired too'",
        next: "bad_signal",
        delta: { chaos: 14, distance: 14, trust: -12 },
        flag: "defended_pride",
      },
    ],
  },
  boss_fight: {
    id: "boss_fight",
    act: "03:15",
    speakerRu: "Мио",
    speakerEn: "Mio",
    sceneRu: "Финальный уровень аркады",
    sceneEn: "Final arcade level",
    mood: "warm",
    lineRu:
      "Вы проходите уровень почти идеально, пока Мио не ошибается на последней платформе. Она ждет, что ты скажешь: «Ну вот опять».",
    lineEn:
      "You almost clear the level perfectly until Mio misses the last platform. She waits for you to say, 'Again?'",
    choices: [
      {
        id: "laugh_together",
        textRu: "Рассмеяться вместе и начать заново",
        textEn: "Laugh together and restart",
        next: "good_ending",
        delta: { spark: 18, trust: 13, chaos: -5 },
        flag: "restart_together",
      },
      {
        id: "teach_gently",
        textRu: "Показать трюк мягко, не делая ее маленькой",
        textEn: "Show the trick gently, without making her feel small",
        next: "good_ending",
        delta: { trust: 18, spark: 8, truth: 5 },
        flag: "gentle_teach",
      },
      {
        id: "take_controller",
        textRu: "Забрать управление, чтобы точно победить",
        textEn: "Take the controls to make sure you win",
        next: "mirror_route",
        delta: { trust: -14, distance: 10, chaos: 10 },
        flag: "controlled_win",
      },
    ],
  },
  mirror_route: {
    id: "mirror_route",
    act: "03:33",
    speakerRu: "Мио",
    speakerEn: "Mio",
    sceneRu: "Зеркальный коридор",
    sceneEn: "Mirror corridor",
    mood: "glitch",
    lineRu:
      "Зеркала показывают не лица, а версии ваших ссор. Мио признается: «Я иногда проверяла, останешься ли ты, даже когда сама отталкивала».",
    lineEn:
      "Mirrors show not faces, but versions of your fights. Mio admits: 'Sometimes I tested whether you would stay, even while pushing you away.'",
    choices: [
      {
        id: "boundary",
        textRu: "Сказать мягко: любовь не должна быть тестом",
        textEn: "Say softly: love should not be a test",
        next: "true_ending",
        delta: { trust: 16, truth: 18, chaos: -10 },
        flag: "set_boundary",
      },
      {
        id: "confess_fear",
        textRu: "Признаться, что ты тоже проверял ее молчанием",
        textEn: "Admit you also tested her with silence",
        next: "true_ending",
        delta: { truth: 20, trust: 12, distance: -10 },
        flag: "mutual_admit",
      },
      {
        id: "blame_test",
        textRu: "Обвинить ее в играх",
        textEn: "Accuse her of playing games",
        next: "bad_signal",
        delta: { chaos: 18, trust: -18, distance: 18 },
        flag: "blamed_tests",
      },
    ],
  },
  confession_bridge: {
    id: "confession_bridge",
    act: "04:04",
    speakerRu: "Система",
    speakerEn: "System",
    sceneRu: "Мост первого признания",
    sceneEn: "Bridge of the first confession",
    mood: "soft",
    lineRu:
      "На мосту все выглядит меньше, чем в памяти. Может, любовь и не должна быть огромной. Может, она должна быть точной.",
    lineEn:
      "On the bridge, everything looks smaller than in memory. Maybe love does not need to be huge. Maybe it needs to be precise.",
    choices: [
      {
        id: "new_promise",
        textRu: "Дать новое обещание: маленькое, но выполнимое",
        textEn: "Make a new promise: small, but keepable",
        next: "true_ending",
        delta: { trust: 20, truth: 12, distance: -16 },
        flag: "small_promise",
      },
      {
        id: "first_photo",
        textRu: "Сделать новое фото вместо поиска старого",
        textEn: "Take a new photo instead of searching for the old one",
        next: "good_ending",
        delta: { spark: 16, trust: 10, chaos: -4 },
        flag: "new_photo",
      },
      {
        id: "let_go",
        textRu: "Честно признать, что вы можете выбрать разные дороги",
        textEn: "Admit honestly that you may choose different roads",
        next: "quiet_ending",
        delta: { truth: 18, trust: 8, distance: 5 },
        flag: "honest_roads",
      },
    ],
  },
  good_ending: {
    id: "good_ending",
    act: "END A",
    speakerRu: "Концовка: Перезапуск",
    speakerEn: "Ending: Restart",
    sceneRu: "Утро после аркады",
    sceneEn: "Morning after the arcade",
    mood: "warm",
    lineRu:
      "Вы не чините все сразу. Но впервые за долгое время ошибка не заканчивает уровень. Она становится местом, где вы смеетесь и начинаете заново.",
    lineEn:
      "You do not fix everything at once. But for the first time in a long time, a mistake does not end the level. It becomes the place where you laugh and restart.",
    choices: [],
  },
  true_ending: {
    id: "true_ending",
    act: "END S",
    speakerRu: "Концовка: Честный режим",
    speakerEn: "Ending: Honest Mode",
    sceneRu: "Рассвет на мосту",
    sceneEn: "Sunrise on the bridge",
    mood: "soft",
    lineRu:
      "Вы выбираете не идеальную любовь, а взрослую: с границами, правдой и маленькими обещаниями, которые можно выполнить уже сегодня.",
    lineEn:
      "You choose not perfect love, but grown love: with boundaries, truth, and small promises you can keep today.",
    choices: [],
  },
  quiet_ending: {
    id: "quiet_ending",
    act: "END B",
    speakerRu: "Концовка: Тихий свет",
    speakerEn: "Ending: Quiet Light",
    sceneRu: "Подъезд, теплый свет",
    sceneEn: "Front door, warm light",
    mood: "night",
    lineRu:
      "Вы не заставляете ночь стать финалом. Иногда любовь выживает именно потому, что никто не тащит ее силой.",
    lineEn:
      "You do not force the night to become a finale. Sometimes love survives because nobody drags it by force.",
    choices: [],
  },
  bad_signal: {
    id: "bad_signal",
    act: "END C",
    speakerRu: "Концовка: Потерянный сигнал",
    speakerEn: "Ending: Lost Signal",
    sceneRu: "Пустая остановка",
    sceneEn: "Empty bus stop",
    mood: "danger",
    lineRu:
      "Сообщение остается непрочитанным. Это не конец навсегда, но игра честно сохраняет результат: иногда молчание тоже выбор.",
    lineEn:
      "The message remains unread. It is not forever, but the game saves the result honestly: sometimes silence is also a choice.",
    choices: [],
  },
};

export function clampStat(value: number) {
  return Math.max(0, Math.min(100, value));
}

export function getEndingGrade(stats: Record<PixelStat, number>) {
  const score = stats.trust + stats.spark + stats.truth - stats.distance - stats.chaos / 2;
  if (score >= 170) return "S";
  if (score >= 120) return "A";
  if (score >= 70) return "B";
  return "C";
}
