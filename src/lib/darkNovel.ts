export type NovelStat = "bravery" | "doubt" | "tenderness" | "obsession";

export type NovelChoice = {
  id: string;
  ru: string;
  en: string;
  next: string;
  delta: Partial<Record<NovelStat, number>>;
  flag?: string;
};

export type NovelScene = {
  id: string;
  chapter: string;
  placeRu: string;
  placeEn: string;
  speakerRu: string;
  speakerEn: string;
  textRu: string;
  textEn: string;
  backdrop: "yard" | "forest" | "bus" | "room" | "school" | "lake" | "dream";
  portrait: "mira" | "mira_shadow" | "anton" | "stranger" | "none";
  tone: "calm" | "cold" | "panic" | "tender" | "nightmare";
  choices: NovelChoice[];
};

export const novelInitialStats: Record<NovelStat, number> = {
  bravery: 35,
  doubt: 30,
  tenderness: 45,
  obsession: 20,
};

export const novelStatLabels: Record<NovelStat, { ru: string; en: string }> = {
  bravery: { ru: "смелость", en: "bravery" },
  doubt: { ru: "сомнение", en: "doubt" },
  tenderness: { ru: "тепло", en: "tenderness" },
  obsession: { ru: "одержимость", en: "obsession" },
};

export const novelScenes: Record<string, NovelScene> = {
  start: {
    id: "start",
    chapter: "Глава 1",
    placeRu: "Поселок. Первый снег",
    placeEn: "Settlement. First snow",
    speakerRu: "Рассказчик",
    speakerEn: "Narrator",
    backdrop: "yard",
    portrait: "none",
    tone: "cold",
    textRu:
      "Мы переехали туда, где автобусы ходят редко, люди говорят шепотом, а лес начинается сразу за последним фонарем. В первый же вечер я увидел на снегу следы босых ног.",
    textEn:
      "We moved to a place where buses are rare, people whisper, and the forest starts right after the last streetlight. On the first evening, I saw barefoot tracks in the snow.",
    choices: [
      { id: "follow", ru: "Пойти по следам", en: "Follow the tracks", next: "tracks", delta: { bravery: 12, doubt: 6 }, flag: "followed_tracks" },
      { id: "home", ru: "Вернуться домой и закрыть дверь", en: "Go home and lock the door", next: "room", delta: { doubt: 10, bravery: -4 }, flag: "locked_door" },
      { id: "photo", ru: "Сфотографировать следы", en: "Photograph the tracks", next: "photo", delta: { doubt: 8, obsession: 7 }, flag: "took_photo" },
    ],
  },
  tracks: {
    id: "tracks",
    chapter: "Глава 1",
    placeRu: "Опушка",
    placeEn: "Forest edge",
    speakerRu: "Мира",
    speakerEn: "Mira",
    backdrop: "forest",
    portrait: "mira",
    tone: "calm",
    textRu:
      "Девочка стояла между березами, будто ее нарисовали поверх реальности. «Ты тоже слышишь, как лес зовет по имени?»",
    textEn:
      "A girl stood between the birches, as if drawn over reality. 'Do you hear the forest calling your name too?'",
    choices: [
      { id: "yes", ru: "Ответить честно: «Да»", en: "Answer honestly: 'Yes'", next: "mira_name", delta: { tenderness: 8, obsession: 9 }, flag: "heard_forest" },
      { id: "lie", ru: "Солгать: «Нет, я просто гуляю»", en: "Lie: 'No, I am just walking'", next: "mira_smile", delta: { doubt: 8, bravery: -2 }, flag: "lied_first" },
      { id: "run", ru: "Развернуться и побежать", en: "Turn and run", next: "bus_stop", delta: { bravery: -8, doubt: 12 }, flag: "ran_away" },
    ],
  },
  room: {
    id: "room",
    chapter: "Глава 1",
    placeRu: "Комната. Ночь",
    placeEn: "Room. Night",
    speakerRu: "Телефон",
    speakerEn: "Phone",
    backdrop: "room",
    portrait: "none",
    tone: "panic",
    textRu:
      "В 03:13 телефон включился сам. На экране была фотография моего окна. Снаружи кто-то пальцем написал на стекле: «Ты уже выбрал».",
    textEn:
      "At 03:13 the phone turned on by itself. On the screen was a photo of my window. Outside, someone had written on the glass: 'You already chose.'",
    choices: [
      { id: "open", ru: "Открыть окно", en: "Open the window", next: "window", delta: { bravery: 10, obsession: 8 }, flag: "opened_window" },
      { id: "parents", ru: "Разбудить родителей", en: "Wake your parents", next: "morning_school", delta: { doubt: 6, tenderness: 4 }, flag: "called_parents" },
      { id: "delete", ru: "Удалить фото и не смотреть", en: "Delete the photo and stop looking", next: "bad_dream", delta: { doubt: 12, bravery: -5 }, flag: "deleted_proof" },
    ],
  },
  photo: {
    id: "photo",
    chapter: "Глава 1",
    placeRu: "Двор. Синий сумрак",
    placeEn: "Yard. Blue dusk",
    speakerRu: "Рассказчик",
    speakerEn: "Narrator",
    backdrop: "yard",
    portrait: "none",
    tone: "cold",
    textRu:
      "На фото следы были не босыми. Это были отпечатки маленьких лап. Но когда я опустил телефон, на снегу снова стояли человеческие следы.",
    textEn:
      "In the photo, the tracks were not barefoot. They were small paw prints. But when I lowered the phone, human footprints were there again.",
    choices: [
      { id: "forest", ru: "Идти к лесу", en: "Go to the forest", next: "tracks", delta: { bravery: 9, obsession: 6 }, flag: "trusted_photo" },
      { id: "school", ru: "Показать фото в школе", en: "Show the photo at school", next: "morning_school", delta: { doubt: 8 }, flag: "showed_photo" },
      { id: "hide", ru: "Спрятать фото от всех", en: "Hide the photo from everyone", next: "room", delta: { obsession: 8, tenderness: -3 }, flag: "kept_secret" },
    ],
  },
  mira_name: {
    id: "mira_name",
    chapter: "Глава 2",
    placeRu: "Лесная тропа",
    placeEn: "Forest path",
    speakerRu: "Мира",
    speakerEn: "Mira",
    backdrop: "forest",
    portrait: "mira",
    tone: "tender",
    textRu:
      "«Тогда не говори ему свое настоящее имя», сказала она. «Лес любит имена. Особенно тех, кто хочет быть найденным».",
    textEn:
      "'Then do not tell it your real name,' she said. 'The forest loves names. Especially the names of those who want to be found.'",
    choices: [
      { id: "fake", ru: "Назваться чужим именем", en: "Use a fake name", next: "bus_stop", delta: { doubt: 7, bravery: 4 }, flag: "fake_name" },
      { id: "real", ru: "Назвать настоящее имя", en: "Say your real name", next: "lake", delta: { obsession: 16, tenderness: 4 }, flag: "gave_name" },
      { id: "ask", ru: "Спросить имя леса", en: "Ask the forest's name", next: "bad_dream", delta: { bravery: 10, obsession: 12 }, flag: "asked_forest_name" },
    ],
  },
  mira_smile: {
    id: "mira_smile",
    chapter: "Глава 2",
    placeRu: "Опушка",
    placeEn: "Forest edge",
    speakerRu: "Мира",
    speakerEn: "Mira",
    backdrop: "forest",
    portrait: "mira_shadow",
    tone: "nightmare",
    textRu:
      "Она улыбнулась слишком широко. «Врать можно людям. Лесу нельзя. Он запоминает, как дрожит голос».",
    textEn:
      "She smiled too wide. 'You can lie to people. Not to the forest. It remembers how your voice shakes.'",
    choices: [
      { id: "sorry", ru: "Извиниться", en: "Apologize", next: "mira_name", delta: { tenderness: 9, doubt: -3 }, flag: "apologized_mira" },
      { id: "threat", ru: "Сказать, что не боишься", en: "Say you are not afraid", next: "lake", delta: { bravery: 14, obsession: 7 }, flag: "challenged_forest" },
      { id: "leave", ru: "Уйти к остановке", en: "Leave for the bus stop", next: "bus_stop", delta: { doubt: 10 }, flag: "left_mira" },
    ],
  },
  bus_stop: {
    id: "bus_stop",
    chapter: "Глава 2",
    placeRu: "Остановка у трассы",
    placeEn: "Roadside bus stop",
    speakerRu: "Незнакомец",
    speakerEn: "Stranger",
    backdrop: "bus",
    portrait: "stranger",
    tone: "cold",
    textRu:
      "Старик в мокрой шапке сидел на лавке, хотя автобус не ходит после девяти. «Не бери у девочки красную ленту. Кто взял, тот возвращался другим».",
    textEn:
      "An old man in a wet hat sat on the bench, though no buses run after nine. 'Do not take the girl's red ribbon. Those who took it returned different.'",
    choices: [
      { id: "believe", ru: "Поверить ему", en: "Believe him", next: "morning_school", delta: { doubt: 8, bravery: 5 }, flag: "believed_stranger" },
      { id: "ask_ribbon", ru: "Спросить про ленту", en: "Ask about the ribbon", next: "ribbon_story", delta: { obsession: 10, doubt: 6 }, flag: "asked_ribbon" },
      { id: "ignore", ru: "Сделать вид, что не слышал", en: "Pretend you did not hear", next: "lake", delta: { obsession: 8, tenderness: -4 }, flag: "ignored_warning" },
    ],
  },
  window: {
    id: "window",
    chapter: "Глава 2",
    placeRu: "Окно",
    placeEn: "Window",
    speakerRu: "Голос",
    speakerEn: "Voice",
    backdrop: "room",
    portrait: "mira_shadow",
    tone: "panic",
    textRu:
      "За окном никого не было. Только красная лента, привязанная к ветке. Она стучала в стекло, хотя ветра не было.",
    textEn:
      "No one was outside. Only a red ribbon tied to a branch. It tapped the glass though there was no wind.",
    choices: [
      { id: "take", ru: "Взять ленту", en: "Take the ribbon", next: "lake", delta: { obsession: 18, tenderness: 6 }, flag: "took_ribbon" },
      { id: "burn", ru: "Сжечь ленту", en: "Burn the ribbon", next: "bad_dream", delta: { bravery: 12, doubt: 10 }, flag: "burned_ribbon" },
      { id: "leave", ru: "Оставить до утра", en: "Leave it until morning", next: "morning_school", delta: { doubt: 5, obsession: -2 }, flag: "left_ribbon" },
    ],
  },
  morning_school: {
    id: "morning_school",
    chapter: "Глава 3",
    placeRu: "Школа",
    placeEn: "School",
    speakerRu: "Одноклассница",
    speakerEn: "Classmate",
    backdrop: "school",
    portrait: "none",
    tone: "calm",
    textRu:
      "На доске мелом было написано мое имя, хотя урок еще не начался. Под именем стояла дата завтрашнего дня.",
    textEn:
      "My name was written on the board in chalk, though class had not started. Under it was tomorrow's date.",
    choices: [
      { id: "erase", ru: "Стереть имя", en: "Erase the name", next: "bad_dream", delta: { bravery: 8, doubt: 10 }, flag: "erased_name" },
      { id: "keep", ru: "Оставить и дождаться учителя", en: "Leave it and wait for the teacher", next: "ribbon_story", delta: { doubt: 6, tenderness: 3 }, flag: "waited_teacher" },
      { id: "run_forest", ru: "Сбежать с уроков к лесу", en: "Skip class and run to the forest", next: "lake", delta: { obsession: 14, bravery: 7 }, flag: "skipped_to_forest" },
    ],
  },
  ribbon_story: {
    id: "ribbon_story",
    chapter: "Глава 3",
    placeRu: "Архив школы",
    placeEn: "School archive",
    speakerRu: "Запись",
    speakerEn: "Record",
    backdrop: "school",
    portrait: "mira_shadow",
    tone: "cold",
    textRu:
      "В старом журнале была фотография Миры. Подпись: «Пропала зимой. Красная лента найдена на озере». На фото она смотрела прямо на меня.",
    textEn:
      "An old register held Mira's photo. Caption: 'Missing in winter. Red ribbon found by the lake.' In the photo, she looked straight at me.",
    choices: [
      { id: "lake", ru: "Идти к озеру", en: "Go to the lake", next: "lake", delta: { bravery: 10, obsession: 12 }, flag: "found_record" },
      { id: "tell", ru: "Рассказать взрослым", en: "Tell the adults", next: "quiet_ending", delta: { tenderness: 10, doubt: 8 }, flag: "told_adults" },
      { id: "tear", ru: "Вырвать страницу", en: "Tear out the page", next: "bad_dream", delta: { obsession: 16, doubt: 6 }, flag: "stole_page" },
    ],
  },
  lake: {
    id: "lake",
    chapter: "Финал",
    placeRu: "Замерзшее озеро",
    placeEn: "Frozen lake",
    speakerRu: "Мира",
    speakerEn: "Mira",
    backdrop: "lake",
    portrait: "mira_shadow",
    tone: "nightmare",
    textRu:
      "Лед под ногами был черным. Мира стояла в центре озера и держала красную ленту. «Если завяжешь ее на руке, ты больше никогда не будешь один».",
    textEn:
      "The ice beneath my feet was black. Mira stood at the center holding the red ribbon. 'Tie it around your wrist, and you will never be alone again.'",
    choices: [
      { id: "tie", ru: "Завязать ленту", en: "Tie the ribbon", next: "dark_ending", delta: { obsession: 25, tenderness: 8, doubt: -8 }, flag: "accepted_ribbon" },
      { id: "refuse", ru: "Отказаться и назвать свое имя вслух", en: "Refuse and say your name aloud", next: "true_ending", delta: { bravery: 18, doubt: -5, obsession: -10 }, flag: "refused_forest" },
      { id: "save", ru: "Попытаться вывести Миру с озера", en: "Try to lead Mira off the lake", next: "soft_ending", delta: { tenderness: 18, bravery: 8 }, flag: "tried_save_mira" },
    ],
  },
  bad_dream: {
    id: "bad_dream",
    chapter: "Сон",
    placeRu: "Сон без выхода",
    placeEn: "Dream without exit",
    speakerRu: "Лес",
    speakerEn: "Forest",
    backdrop: "dream",
    portrait: "stranger",
    tone: "nightmare",
    textRu:
      "Во сне поселок был пустым. На каждой двери висела красная лента. Из леса доносился мой голос, но он звал не меня.",
    textEn:
      "In the dream, the settlement was empty. A red ribbon hung on every door. My voice came from the forest, but it was not calling me.",
    choices: [
      { id: "wake", ru: "Проснуться любой ценой", en: "Wake up at any cost", next: "morning_school", delta: { bravery: 10, doubt: 8 }, flag: "escaped_dream" },
      { id: "answer", ru: "Ответить голосу", en: "Answer the voice", next: "dark_ending", delta: { obsession: 20 }, flag: "answered_forest" },
      { id: "listen", ru: "Слушать до конца", en: "Listen until the end", next: "ribbon_story", delta: { doubt: 12, tenderness: -4 }, flag: "listened_dream" },
    ],
  },
  true_ending: {
    id: "true_ending",
    chapter: "Концовка",
    placeRu: "Озеро. Рассвет",
    placeEn: "Lake. Dawn",
    speakerRu: "Рассказчик",
    speakerEn: "Narrator",
    backdrop: "lake",
    portrait: "none",
    tone: "calm",
    textRu:
      "Лес замолчал, когда я назвал себя. Не героя, не жертву, не того, кого можно увести. Просто себя.",
    textEn:
      "The forest went silent when I named myself. Not a hero, not a victim, not someone it could take. Just myself.",
    choices: [],
  },
  soft_ending: {
    id: "soft_ending",
    chapter: "Концовка",
    placeRu: "Берег",
    placeEn: "Shore",
    speakerRu: "Мира",
    speakerEn: "Mira",
    backdrop: "lake",
    portrait: "mira",
    tone: "tender",
    textRu:
      "Мира не вышла из леса. Но утром на берегу остались две дорожки следов: мои ботинки и маленькие босые ноги, идущие рядом.",
    textEn:
      "Mira did not leave the forest. But in the morning, two lines of tracks remained on the shore: my boots and small bare feet walking beside them.",
    choices: [],
  },
  quiet_ending: {
    id: "quiet_ending",
    chapter: "Концовка",
    placeRu: "Кухня. Утро",
    placeEn: "Kitchen. Morning",
    speakerRu: "Рассказчик",
    speakerEn: "Narrator",
    backdrop: "room",
    portrait: "none",
    tone: "calm",
    textRu:
      "Взрослые не поверили сразу. Но в тот день меня не пустили к лесу. Иногда спасение выглядит скучно. Иногда именно поэтому оно работает.",
    textEn:
      "The adults did not believe me at first. But that day, they kept me away from the forest. Sometimes rescue looks boring. Sometimes that is why it works.",
    choices: [],
  },
  dark_ending: {
    id: "dark_ending",
    chapter: "Концовка",
    placeRu: "Лес",
    placeEn: "Forest",
    speakerRu: "Лес",
    speakerEn: "Forest",
    backdrop: "dream",
    portrait: "mira_shadow",
    tone: "nightmare",
    textRu:
      "Красная лента стала теплой. Я хотел крикнуть, но лес уже говорил моим голосом. Дома потом нашли только следы. Босые. Маленькие. Свежие.",
    textEn:
      "The red ribbon became warm. I wanted to scream, but the forest was already speaking with my voice. Later, they found only tracks. Bare. Small. Fresh.",
    choices: [],
  },
};

export function clampNovelStat(value: number) {
  return Math.max(0, Math.min(100, value));
}

export function getNovelEnding(stats: Record<NovelStat, number>) {
  if (stats.obsession > 72) return "Темная ветка";
  if (stats.bravery > 65 && stats.doubt < 55) return "Истинная ветка";
  if (stats.tenderness > 65) return "Мягкая ветка";
  return "Неясная ветка";
}
