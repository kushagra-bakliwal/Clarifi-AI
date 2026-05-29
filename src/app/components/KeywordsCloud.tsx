import { useMemo } from 'react';

interface KeywordsCloudProps {
  keywords?: Array<{ text: string; value: number }>;
}

const defaultWords = [
  { text: 'Slow', value: 84 },
  { text: 'Crash', value: 72 },
  { text: 'Expensive', value: 65 },
  { text: 'Bug', value: 58 },
  { text: 'Error', value: 52 },
  { text: 'Login', value: 48 },
  { text: 'Loading', value: 45 },
  { text: 'Frustrating', value: 38 },
  { text: 'Confusing', value: 35 },
  { text: 'Missing', value: 32 },
  { text: 'Broken', value: 28 },
  { text: 'Complicated', value: 25 },
  { text: 'Glitch', value: 22 },
  { text: 'Freeze', value: 20 },
  { text: 'Lag', value: 18 },
];

// Seeded pseudo-random for deterministic layout
function seededRandom(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

export function KeywordsCloud({ keywords }: KeywordsCloudProps) {
  const words = keywords && keywords.length > 0 ? keywords : defaultWords;

  const processedWords = useMemo(() => {
    const maxValue = Math.max(...words.map(w => w.value));
    const minValue = Math.min(...words.map(w => w.value));
    const range = maxValue - minValue || 1;

    return words.map((word, i) => {
      const normalized = (word.value - minValue) / range; // 0–1
      // Font size: 13px to 46px
      const fontSize = Math.round(13 + normalized * 33);

      // Color: light red → deep red based on value
      const red = Math.round(220 - normalized * 80);   // 220 → 140
      const green = Math.round(80 - normalized * 60);  // 80 → 20
      const blue = Math.round(80 - normalized * 60);   // 80 → 20
      const color = `rgb(${red}, ${green}, ${blue})`;

      // Slight rotation variety (only horizontal / slight tilt)
      const rotations = [0, 0, 0, -10, 10, -5, 5];
      const rotation = rotations[i % rotations.length];

      // Random opacity variation for visual depth
      const opacity = 0.75 + seededRandom(i * 7) * 0.25;

      return { ...word, fontSize, color, rotation, opacity };
    });
  }, [words]);

  // Sort by value desc so bigger words appear first (natural flow)
  const sortedWords = useMemo(
    () => [...processedWords].sort((a, b) => b.value - a.value),
    [processedWords]
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Negative Feedback Keywords</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Most mentioned terms in critical reviews</p>
      </div>

      {/* Word Cloud */}
      <div
        className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 min-h-[200px] py-4 px-2 select-none"
        aria-label="Keyword word cloud"
      >
        {sortedWords.map((word, idx) => (
          <span
            key={`${word.text}-${idx}`}
            title={`${word.text}: ${word.value} mentions`}
            style={{
              fontSize: `${word.fontSize}px`,
              color: word.color,
              transform: `rotate(${word.rotation}deg)`,
              opacity: word.opacity,
              lineHeight: 1.15,
              cursor: 'default',
              transition: 'opacity 0.2s, transform 0.2s',
              display: 'inline-block',
              fontWeight: word.fontSize >= 30 ? 700 : word.fontSize >= 22 ? 600 : 500,
            }}
            className="hover:opacity-100 hover:scale-110"
          >
            {word.text}
          </span>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Based on analysis of negative reviews from uploaded data
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 dark:text-gray-500">Less</span>
          <div className="flex gap-0.5">
            {['#e86060', '#d94040', '#c92020', '#b81818', '#8b0e0e'].map((c, i) => (
              <div
                key={i}
                className="w-4 h-2 rounded-sm"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500">More</span>
        </div>
      </div>
    </div>
  );
}
