import React from 'react';

const LANGUAGES = [
  { id: 'python', name: 'Python', icon: '🐍', available: true },
  { id: 'javascript', name: 'JavaScript', icon: '📜', available: false },
  { id: 'java', name: 'Java', icon: '☕', available: false },
  { id: 'cpp', name: 'C++', icon: '⚙️', available: false },
  { id: 'go', name: 'Go', icon: '🔷', available: false },
  { id: 'rust', name: 'Rust', icon: '🦀', available: false }
];

const LanguageSelector = ({ selectedLanguage = 'python', onLanguageChange }) => {
  const handleChange = (languageId) => {
    const language = LANGUAGES.find(lang => lang.id === languageId);
    if (language && language.available && onLanguageChange) {
      onLanguageChange(languageId);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-[var(--text-secondary)]">
        Language:
      </label>
      <div className="relative">
        <select
          value={selectedLanguage}
          onChange={(e) => handleChange(e.target.value)}
          className="appearance-none bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded px-3 py-2 pr-8 text-sm font-medium cursor-pointer hover:border-[var(--accent-primary)] transition-colors"
        >
          {LANGUAGES.map(lang => (
            <option
              key={lang.id}
              value={lang.id}
              disabled={!lang.available}
            >
              {lang.icon} {lang.name} {!lang.available ? '(Coming Soon)' : ''}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--text-secondary)]">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
      <div className="text-xs text-[var(--text-secondary)]">
        More languages coming soon
      </div>
    </div>
  );
};

export default LanguageSelector;
