import React, { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import LanguageSelector from './LanguageSelector';

const COMPANIES = [
  'All Companies',
  'Google',
  'Meta',
  'Amazon',
  'Microsoft',
  'Apple',
  'Netflix',
  'Uber',
  'Airbnb',
  'LinkedIn',
  'Stripe'
];

const SettingsModal = ({ onClose }) => {
  const { theme, toggleTheme } = useTheme();
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('interviewforge-settings');
    return saved ? JSON.parse(saved) : {
      autocomplete: true,
      timerDuration: 45,
      timerMode: 'countdown',
      selectedCompanies: ['All Companies'],
      difficulty: 'All',
      autoSave: true,
      soundEnabled: true,
      language: 'python'
    };
  });

  useEffect(() => {
    localStorage.setItem('interviewforge-settings', JSON.stringify(settings));
  }, [settings]);

  const handleClose = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleCompanyToggle = (company) => {
    setSettings(prev => {
      const current = prev.selectedCompanies || [];
      const isSelected = current.includes(company);

      if (company === 'All Companies') {
        return { ...prev, selectedCompanies: ['All Companies'] };
      }

      let newSelection = isSelected
        ? current.filter(c => c !== company)
        : [...current.filter(c => c !== 'All Companies'), company];

      if (newSelection.length === 0) {
        newSelection = ['All Companies'];
      }

      return { ...prev, selectedCompanies: newSelection };
    });
  };

  const resetSettings = () => {
    const confirmed = window.confirm('Reset all settings to default?');
    if (confirmed) {
      const defaults = {
        autocomplete: true,
        timerDuration: 45,
        timerMode: 'countdown',
        selectedCompanies: ['All Companies'],
        difficulty: 'All',
        autoSave: true,
        soundEnabled: true,
        language: 'python'
      };
      setSettings(defaults);
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content">
        {/* Header */}
        <div className="panel-header flex justify-between items-center">
          <h2 className="text-xl font-bold">Settings</h2>
          <button
            onClick={onClose}
            className="text-2xl leading-none hover:text-[var(--accent-primary)] transition-colors"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Appearance */}
            <section>
              <h3 className="text-lg font-semibold mb-3">Appearance</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded">
                  <div>
                    <div className="font-medium">Theme</div>
                    <div className="text-sm text-[var(--text-secondary)]">
                      Switch between light and dark mode
                    </div>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="btn btn-sm btn-primary"
                  >
                    {theme === 'dark' ? 'Light' : 'Dark'}
                  </button>
                </div>
              </div>
            </section>

            {/* Editor Settings */}
            <section>
              <h3 className="text-lg font-semibold mb-3">Editor</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded">
                  <div>
                    <div className="font-medium">Autocomplete</div>
                    <div className="text-sm text-[var(--text-secondary)]">
                      Enable code suggestions and autocompletion
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autocomplete}
                      onChange={(e) => updateSetting('autocomplete', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-[var(--accent-primary)] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded">
                  <div>
                    <div className="font-medium">Auto-save</div>
                    <div className="text-sm text-[var(--text-secondary)]">
                      Automatically save changes (1 second debounce)
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoSave}
                      onChange={(e) => updateSetting('autoSave', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-[var(--accent-primary)] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>

                <div className="p-3 bg-[var(--bg-secondary)] rounded">
                  <LanguageSelector
                    selectedLanguage={settings.language}
                    onLanguageChange={(lang) => updateSetting('language', lang)}
                  />
                </div>
              </div>
            </section>

            {/* Timer Settings */}
            <section>
              <h3 className="text-lg font-semibold mb-3">Timer</h3>
              <div className="space-y-3">
                <div className="p-3 bg-[var(--bg-secondary)] rounded">
                  <div className="font-medium mb-2">Duration (minutes)</div>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={settings.timerDuration}
                    onChange={(e) => updateSetting('timerDuration', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded"
                  />
                </div>

                <div className="p-3 bg-[var(--bg-secondary)] rounded">
                  <div className="font-medium mb-2">Mode</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateSetting('timerMode', 'countdown')}
                      className={`flex-1 py-2 rounded ${
                        settings.timerMode === 'countdown'
                          ? 'btn-primary'
                          : 'btn-secondary'
                      }`}
                    >
                      Countdown
                    </button>
                    <button
                      onClick={() => updateSetting('timerMode', 'countup')}
                      className={`flex-1 py-2 rounded ${
                        settings.timerMode === 'countup'
                          ? 'btn-primary'
                          : 'btn-secondary'
                      }`}
                    >
                      Count Up
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded">
                  <div>
                    <div className="font-medium">Sound alerts</div>
                    <div className="text-sm text-[var(--text-secondary)]">
                      Play sound when timer finishes
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.soundEnabled}
                      onChange={(e) => updateSetting('soundEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-[var(--accent-primary)] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>
              </div>
            </section>

            {/* Problem Selection */}
            <section>
              <h3 className="text-lg font-semibold mb-3">Problem Filters</h3>
              <div className="space-y-3">
                <div className="p-3 bg-[var(--bg-secondary)] rounded">
                  <div className="font-medium mb-2">Difficulty</div>
                  <select
                    value={settings.difficulty}
                    onChange={(e) => updateSetting('difficulty', e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded"
                  >
                    <option value="All">All Difficulties</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div className="p-3 bg-[var(--bg-secondary)] rounded">
                  <div className="font-medium mb-2">Companies</div>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {COMPANIES.map(company => (
                      <label
                        key={company}
                        className="flex items-center gap-2 p-2 hover:bg-[var(--bg-primary)] rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={settings.selectedCompanies?.includes(company)}
                          onChange={() => handleCompanyToggle(company)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{company}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--border-color)] p-4 flex justify-between">
          <button
            onClick={resetSettings}
            className="btn btn-secondary"
          >
            Reset to Defaults
          </button>
          <button
            onClick={onClose}
            className="btn btn-primary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
