import { useState, useEffect } from "react";
import { Palette, Sun, Moon, Monitor, Check, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeCustomizer({ isOpen, onClose }) {
  const { themeConfig, applyThemeCustomization } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState(themeConfig.theme);
  const [primaryColor, setPrimaryColor] = useState(themeConfig.primaryColor);
  const [backgroundStyle, setBackgroundStyle] = useState(themeConfig.backgroundStyle);
  const [fontSize, setFontSize] = useState(themeConfig.fontSize);

  useEffect(() => {
    setSelectedTheme(themeConfig.theme);
    setPrimaryColor(themeConfig.primaryColor);
    setBackgroundStyle(themeConfig.backgroundStyle);
    setFontSize(themeConfig.fontSize);
  }, [themeConfig]);

  const themes = [
    {
      id: 'light',
      name: 'Light',
      icon: Sun,
      description: 'Clean and bright interface'
    },
    {
      id: 'dark',
      name: 'Dark',
      icon: Moon,
      description: 'Easy on the eyes in low light'
    },
    {
      id: 'system',
      name: 'System',
      icon: Monitor,
      description: 'Follows your system preference'
    }
  ];

  const primaryColors = [
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Orange', value: '#F97316' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Teal', value: '#14B8A6' },
    { name: 'Indigo', value: '#6366F1' }
  ];

  const backgroundStyles = [
    { id: 'solid', name: 'Solid', description: 'Simple solid colors' },
    { id: 'gradient', name: 'Gradient', description: 'Smooth color transitions' },
    { id: 'subtle', name: 'Subtle', description: 'Minimal patterns' }
  ];

  const fontSizes = [
    { id: 'small', name: 'Small', description: 'Compact text' },
    { id: 'medium', name: 'Medium', description: 'Balanced size' },
    { id: 'large', name: 'Large', description: 'Easy to read' }
  ];

  const handleApply = () => {
    applyThemeCustomization({
      theme: selectedTheme,
      primaryColor,
      backgroundStyle,
      fontSize
    });
    onClose();
  };

  const handleReset = () => {
    setSelectedTheme('dark');
    setPrimaryColor('#3B82F6');
    setBackgroundStyle('gradient');
    setFontSize('medium');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Palette className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Theme Customization
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Personalize your chat experience
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Theme Selection */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Theme Mode
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {themes.map((theme) => {
                const Icon = theme.icon;
                const isSelected = selectedTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`relative p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                    )}
                    <Icon className={`w-6 h-6 mx-auto mb-2 ${
                      isSelected
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`} />
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {theme.name}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {theme.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Color */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Accent Color
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {primaryColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setPrimaryColor(color.value)}
                  className={`relative w-full aspect-square rounded-lg border-2 transition-all ${
                    primaryColor === color.value
                      ? 'border-gray-900 dark:border-white scale-110'
                      : 'border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {primaryColor === color.value && (
                    <Check className="w-4 h-4 text-white absolute inset-0 m-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Background Style */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Background Style
            </h3>
            <div className="space-y-2">
              {backgroundStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setBackgroundStyle(style.id)}
                  className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                    backgroundStyle === style.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {style.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {style.description}
                      </div>
                    </div>
                    {backgroundStyle === style.id && (
                      <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Text Size
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {fontSizes.map((size) => (
                <button
                  key={size.id}
                  onClick={() => setFontSize(size.id)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    fontSize === size.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {size.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {size.description}
                      </div>
                    </div>
                    {fontSize === size.id && (
                      <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Preview
            </h3>
            <div className="p-4 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: primaryColor }}
                  ></div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      Sample Message
                    </div>
                    <div className={`text-${
                      fontSize === 'small' ? 'xs' : fontSize === 'large' ? 'base' : 'sm'
                    } text-gray-600 dark:text-gray-400`}>
                      This is how your messages will look
                    </div>
                  </div>
                </div>
                <button
                  className="px-4 py-2 rounded-lg text-white font-medium"
                  style={{ backgroundColor: primaryColor }}
                >
                  Sample Button
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            Reset to Default
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              style={{ backgroundColor: primaryColor }}
            >
              Apply Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}