import { useEffect, useMemo, useState } from 'react';

const EVENT_START = new Date('2026-06-05T21:00:00.000Z').getTime();
const FREE_SPACE_INDEX = 12;
const HOGWARTS_INDEX = 2;
const WORLD_PREMIERE_INDEX = 3;
const WORLD_PREMIERE_GOAL = 5;
const ANIME_GAME_INDEX = 19;
const STORAGE_KEY = 'sgf-2026-bingo-selected-cards';
const WORLD_PREMIERE_STORAGE_KEY = 'sgf-2026-bingo-world-premiere-count';

const cards = [
  'Анонс новой игры от FromSoftware (FMC)',
  'Геймплей The Blood of Dawnwalker',
  'Тизер Hogwarts Legacy 2',
  'Слово «World Premiere» 5+ раз',
  'Уютный инди-симулятор (Cozy game)',
  'Анонс Persona 6',
  'Слишком долгий трейлер неинтересной игры',
  'Трейлер Alien Isolation 2',
  'Геймплей Star Wars: Zero Company',
  'Новый Souls-like проект',
  'Тизер The Elder Scrolls VI',
  'Шутки или интервью от Джеффа Кили',
  'Ничего про GTA 6 (FREE SPACE)',
  'Новости по Final Fantasy 7 Remake (часть 3)',
  'Игра, где ГГ сделали женщиной / FemineStation',
  'Ремастер/ремейк игры, о которой никто не вспоминал лет 10',
  'Новости по Sonic (Sonic Frontiers 2)',
  'Музыкальное выступление',
  'Трейлер/геймплей Gears of War: E-Day',
  'Аниме-игра',
  'Внезапный гость (актёр) на сцене',
  'Новая MMORPG / ММО-проект',
  'Free-to-play игра / Батлпасс',
  'Сначала вау, потом логотип мобильной/FTP-игры»',
  '«One Last Thing» в конце шоу',
];

const winningLines = [
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24],
  [0, 5, 10, 15, 20],
  [1, 6, 11, 16, 21],
  [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23],
  [4, 9, 14, 19, 24],
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20],
];

type TimeLeft = {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getTimeLeft(): TimeLeft {
  const total = Math.max(EVENT_START - Date.now(), 0);

  return {
    total,
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / (1000 * 60)) % 60),
    seconds: Math.floor((total / 1000) % 60),
  };
}

function formatUnit(value: number) {
  return value.toString().padStart(2, '0');
}

function App() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft);
  const [selectedCards, setSelectedCards] = useState<Set<number>>(() => {
    const selected = new Set<number>([FREE_SPACE_INDEX]);
    const savedCards = window.localStorage.getItem(STORAGE_KEY);

    if (!savedCards) {
      return selected;
    }

    try {
      const parsedCards = JSON.parse(savedCards) as number[];
      parsedCards.forEach((index) => {
        if (Number.isInteger(index) && index >= 0 && index < cards.length) {
          selected.add(index);
        }
      });
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }

    return selected;
  });
  const [worldPremiereCount, setWorldPremiereCount] = useState(() => {
    const savedCount = Number(window.localStorage.getItem(WORLD_PREMIERE_STORAGE_KEY));
    return Number.isFinite(savedCount) ? Math.max(0, savedCount) : 0;
  });
  const [celebrationKey, setCelebrationKey] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [narutoEasterKey, setNarutoEasterKey] = useState(0);
  const [showNarutoEaster, setShowNarutoEaster] = useState(false);
  const [hogwartsEasterKey, setHogwartsEasterKey] = useState(0);
  const [showHogwartsEaster, setShowHogwartsEaster] = useState(false);

  const completedLines = useMemo(
    () => winningLines.filter((line) => line.every((index) => selectedCards.has(index))),
    [selectedCards],
  );
  const winningIndexes = useMemo(
    () => new Set(completedLines.flat()),
    [completedLines],
  );
  const markedCount = selectedCards.size;
  const eventStarted = timeLeft.total === 0;
  const hasBingo = completedLines.length > 0;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...selectedCards]));
  }, [selectedCards]);

  useEffect(() => {
    window.localStorage.setItem(WORLD_PREMIERE_STORAGE_KEY, String(worldPremiereCount));

    if (worldPremiereCount < WORLD_PREMIERE_GOAL) {
      return;
    }

    setSelectedCards((currentCards) => {
      if (currentCards.has(WORLD_PREMIERE_INDEX)) {
        return currentCards;
      }

      const nextCards = new Set(currentCards);
      nextCards.add(WORLD_PREMIERE_INDEX);
      nextCards.add(FREE_SPACE_INDEX);
      return nextCards;
    });
  }, [worldPremiereCount]);

  useEffect(() => {
    if (!hasBingo) {
      setShowCelebration(false);
      return;
    }

    setShowCelebration(true);
    setCelebrationKey((key) => key + 1);
  }, [completedLines.length, hasBingo]);

  useEffect(() => {
    if (!showNarutoEaster) {
      return;
    }

    const hideTimer = window.setTimeout(() => {
      setShowNarutoEaster(false);
    }, 3200);

    return () => window.clearTimeout(hideTimer);
  }, [showNarutoEaster, narutoEasterKey]);

  useEffect(() => {
    if (!showHogwartsEaster) {
      return;
    }

    const hideTimer = window.setTimeout(() => {
      setShowHogwartsEaster(false);
    }, 3200);

    return () => window.clearTimeout(hideTimer);
  }, [showHogwartsEaster, hogwartsEasterKey]);

  function toggleCard(index: number) {
    if (index === FREE_SPACE_INDEX) {
      return;
    }

    if (index === WORLD_PREMIERE_INDEX && worldPremiereCount >= WORLD_PREMIERE_GOAL) {
      return;
    }

    const wasSelected = selectedCards.has(index);

    setSelectedCards((currentCards) => {
      const nextCards = new Set(currentCards);

      if (nextCards.has(index)) {
        nextCards.delete(index);
      } else {
        nextCards.add(index);
      }

      nextCards.add(FREE_SPACE_INDEX);
      return nextCards;
    });

    if (index === ANIME_GAME_INDEX && !wasSelected) {
      setShowNarutoEaster(true);
      setNarutoEasterKey((key) => key + 1);
    }

    if (index === HOGWARTS_INDEX && !wasSelected) {
      setShowHogwartsEaster(true);
      setHogwartsEasterKey((key) => key + 1);
    }
  }

  function resetBoard() {
    setSelectedCards(new Set([FREE_SPACE_INDEX]));
    setWorldPremiereCount(0);
  }

  function incrementWorldPremiere() {
    setWorldPremiereCount((count) => count + 1);
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">HappyZerg Twitch Channel</p>
          <h1>Summer Game Fest Bingo 2026</h1>
          <p className="intro">
            Отмечай предсказания во время шоу. Собери ряд, колонку или диагональ,
            чтобы запустить BINGO-праздник на экране.
          </p>
          <div className="social-links" aria-label="Социальные ссылки HappyZerg">
            <a href="https://www.twitch.tv/happyzerg" target="_blank" rel="noreferrer">
              <TwitchIcon />
              Смотреть на Twitch
            </a>
            <a href="https://t.me/happyzerg11" target="_blank" rel="noreferrer">
              <TelegramIcon />
              Telegram канал
            </a>
          </div>
        </div>

        {!eventStarted && (
          <div className="countdown" aria-label="Таймер до Summer Game Fest 2026">
            <span className="countdown-title">До старта шоу</span>
            <div className="countdown-grid">
              <TimeBox label="дней" value={timeLeft.days} />
              <TimeBox label="часов" value={timeLeft.hours} />
              <TimeBox label="минут" value={timeLeft.minutes} />
              <TimeBox label="секунд" value={timeLeft.seconds} />
            </div>
            <span className="countdown-note">6 июня, 00:00 по Москве</span>
          </div>
        )}
      </section>

      <section className={`bingo-card ${hasBingo ? 'is-bingo' : ''}`}>
        <div className="board-header">
          <div>
            <p className="board-kicker">Live prediction board</p>
            <h2>Отмечено: {markedCount}/25</h2>
          </div>
          <button className="reset-button" type="button" onClick={resetBoard}>
            Сбросить все
          </button>
        </div>

        <div className="bingo-grid" aria-label="Summer Game Fest bingo board">
          {cards.map((card, index) => {
            const isSelected = selectedCards.has(index);
            const isWinning = winningIndexes.has(index);
            const isFree = index === FREE_SPACE_INDEX;
            const hasCounter = index === WORLD_PREMIERE_INDEX;

            return (
              <div
                className={[
                  'bingo-tile',
                  isSelected ? 'is-selected' : '',
                  isWinning ? 'is-winning' : '',
                  isFree ? 'is-free' : '',
                  hasCounter ? 'has-counter' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                key={card}
              >
                <button
                  className="tile-hit-area"
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => toggleCard(index)}
                >
                  <span className="tile-number">{formatUnit(index + 1)}</span>
                  <span className="tile-text">{card}</span>
                  <span className="tile-stamp">{isFree ? 'FREE' : 'HIT'}</span>
                </button>

                {hasCounter && (
                  <div className="premiere-counter" aria-label="Счетчик World Premiere">
                    <span>{worldPremiereCount}/{WORLD_PREMIERE_GOAL}</span>
                    <button
                      type="button"
                      aria-label="Добавить World Premiere"
                      onClick={incrementWorldPremiere}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {showCelebration && (
        <div className="celebration" key={celebrationKey} role="status" aria-live="polite">
          <div className="burst burst-one" />
          <div className="burst burst-two" />
          <div className="burst burst-three" />
          <div className="celebration-panel">
            <span className="celebration-subtitle">World Premiere</span>
            <strong>BINGO!</strong>
            <p>
              Линия собрана. Можно кричать в чат, делать клип и готовиться к
              следующему анонсу.
            </p>
            <button type="button" onClick={() => setShowCelebration(false)}>
              Продолжить игру
            </button>
          </div>
        </div>
      )}

      {showNarutoEaster && (
        <div className="naruto-easter" key={narutoEasterKey} role="status" aria-live="polite">
          <span className="naruto-sign">忍</span>
          <div>
            <strong>Теневой клон аниме-анонса!</strong>
            <p>Даттебайо. Чат уже готовит филлерную арку.</p>
          </div>
        </div>
      )}

      {showHogwartsEaster && (
        <div className="hogwarts-easter" key={hogwartsEasterKey} role="status" aria-live="polite">
          <span className="hogwarts-sign">⚡</span>
          <div>
            <strong>Accio World Premiere!</strong>
            <p>Письмо из Хогвартса доставлено. Ждем сову с датой релиза.</p>
          </div>
        </div>
      )}
    </main>
  );
}

function TimeBox({ label, value }: { label: string; value: number }) {
  return (
    <span className="time-box">
      <strong>{formatUnit(value)}</strong>
      <span>{label}</span>
    </span>
  );
}

function TwitchIcon() {
  return (
    <svg aria-hidden="true" className="social-icon" viewBox="0 0 24 24">
      <path d="M4.8 3 3.4 6.8v12.4h4.3V21h2.4l1.9-1.8h3.4l5.2-5.2V3H4.8Zm14 10.1-3 3h-4.3l-1.9 1.8v-1.8H6.2V4.8h12.6v8.3Zm-3-5.2v4.4H14V7.9h1.8Zm-4.8 0v4.4H9.2V7.9H11Z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg aria-hidden="true" className="social-icon" viewBox="0 0 24 24">
      <path d="M21.6 4.4 18.5 19c-.2 1.1-.9 1.4-1.8.9l-4.9-3.6-2.3 2.3c-.3.3-.5.5-1 .5l.3-5 9-8.1c.4-.4-.1-.6-.6-.3L6.1 12.6 1.3 11.1c-1-.3-1-1 .2-1.5L20.3 2.4c.9-.3 1.7.2 1.3 2Z" />
    </svg>
  );
}

export default App;
