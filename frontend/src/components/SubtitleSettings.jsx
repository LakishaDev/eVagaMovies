import { useState, useEffect } from 'react';
import { X, Type, Palette, Blend, AlignCenter } from 'lucide-react';

export default function SubtitleSettings({ isOpen, onClose, videoRef }) {
  const [settings, setSettings] = useState({
    fontSize: 100,
    fontFamily: 'Arial',
    color: '#FFFFFF',
    backgroundColor: '#000000',
    backgroundOpacity: 75,
    textShadow: 'medium',
    textAlign: 'center',
    fontWeight: 'normal',
    textStroke: false
  });

  const fonts = [
    { value: 'Arial', label: 'Arial' },
    { value: 'Helvetica', label: 'Helvetica' },
    { value: 'Verdana', label: 'Verdana' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Courier New', label: 'Courier New' },
    { value: 'Comic Sans MS', label: 'Comic Sans MS' },
    { value: 'Impact', label: 'Impact' },
    { value: 'Trebuchet MS', label: 'Trebuchet MS' },
    { value: 'Palatino', label: 'Palatino' },
    { value: 'Roboto', label: 'Roboto (Modern)' },
    { value: 'Open Sans', label: 'Open Sans (Modern)' },
    { value: 'Montserrat', label: 'Montserrat (Modern)' },
    { value: 'Poppins', label: 'Poppins (Modern)' },
    { value: 'Lato', label: 'Lato (Modern)' }
  ];

  const shadows = [
    { value: 'none', label: 'Bez senke' },
    { value: 'light', label: 'Lagana' },
    { value: 'medium', label: 'Srednja' },
    { value: 'heavy', label: 'Jaka' },
    { value: 'glow', label: 'Glow efekat' }
  ];

  const getShadowCSS = (shadow) => {
    switch(shadow) {
      case 'light':
        return '1px 1px 2px rgba(0,0,0,0.8)';
      case 'medium':
        return '2px 2px 4px rgba(0,0,0,0.9), -1px -1px 2px rgba(0,0,0,0.9)';
      case 'heavy':
        return '3px 3px 6px rgba(0,0,0,1), -2px -2px 4px rgba(0,0,0,1), 0 0 8px rgba(0,0,0,0.8)';
      case 'glow':
        return '0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.6), 2px 2px 4px rgba(0,0,0,0.9)';
      default:
        return 'none';
    }
  };

  useEffect(() => {
    // Load saved settings from localStorage
    const saved = localStorage.getItem('subtitleSettings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    // Save settings to localStorage
    localStorage.setItem('subtitleSettings', JSON.stringify(settings));
    
    // Apply settings to video subtitles
    if (videoRef?.current) {
      const video = videoRef.current;
      const tracks = video.textTracks;
      
      if (tracks.length > 0) {
        const cueStyle = document.getElementById('subtitle-custom-style') || document.createElement('style');
        cueStyle.id = 'subtitle-custom-style';
        
        const bgOpacity = settings.backgroundOpacity / 100;
        const bgColor = hexToRgba(settings.backgroundColor, bgOpacity);
        
        cueStyle.innerHTML = `
          video::cue {
            font-size: ${settings.fontSize}% !important;
            font-family: "${settings.fontFamily}", sans-serif !important;
            color: ${settings.color} !important;
            background-color: ${bgColor} !important;
            text-shadow: ${getShadowCSS(settings.textShadow)} !important;
            text-align: ${settings.textAlign} !important;
            font-weight: ${settings.fontWeight} !important;
            ${settings.textStroke ? `-webkit-text-stroke: 1px ${settings.backgroundColor};` : ''}
            line-height: 1.4 !important;
            padding: 0.2em 0.5em !important;
          }
        `;
        
        if (!document.getElementById('subtitle-custom-style')) {
          document.head.appendChild(cueStyle);
        }
      }
    }
  }, [settings, videoRef]);

  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    const defaults = {
      fontSize: 100,
      fontFamily: 'Arial',
      color: '#FFFFFF',
      backgroundColor: '#000000',
      backgroundOpacity: 75,
      textShadow: 'medium',
      textAlign: 'center',
      fontWeight: 'normal',
      textStroke: false
    };
    setSettings(defaults);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Type className="w-6 h-6 text-accent" />
            Podešavanja Titlova
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition p-2 hover:bg-gray-800 rounded"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Preview */}
        <div className="p-6 bg-gray-800 border-b border-gray-700">
          <p className="text-sm text-gray-400 mb-2">Pregled:</p>
          <div className="bg-black rounded p-8 flex items-center justify-center min-h-[100px]">
            <span
              style={{
                fontSize: `${settings.fontSize}%`,
                fontFamily: settings.fontFamily,
                color: settings.color,
                backgroundColor: hexToRgba(settings.backgroundColor, settings.backgroundOpacity / 100),
                textShadow: getShadowCSS(settings.textShadow),
                textAlign: settings.textAlign,
                fontWeight: settings.fontWeight,
                WebkitTextStroke: settings.textStroke ? `1px ${settings.backgroundColor}` : 'none',
                padding: '0.2em 0.5em',
                lineHeight: '1.4'
              }}
            >
              Primer titla sa podešavanjima
            </span>
          </div>
        </div>

        {/* Settings */}
        <div className="p-6 space-y-6">
          {/* Font Size */}
          <div>
            <label className="flex items-center justify-between text-sm font-medium text-gray-300 mb-2">
              <span className="flex items-center gap-2">
                <Type className="w-4 h-4" />
                Veličina fonta
              </span>
              <span className="text-accent">{settings.fontSize}%</span>
            </label>
            <input
              type="range"
              min="50"
              max="200"
              step="5"
              value={settings.fontSize}
              onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
              className="w-full accent-accent"
            />
          </div>

          {/* Font Family */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Font
            </label>
            <select
              value={settings.fontFamily}
              onChange={(e) => updateSetting('fontFamily', e.target.value)}
              className="w-full bg-gray-800 text-white border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-accent"
            >
              {fonts.map(font => (
                <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>

          {/* Font Weight */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Debljina fonta
            </label>
            <select
              value={settings.fontWeight}
              onChange={(e) => updateSetting('fontWeight', e.target.value)}
              className="w-full bg-gray-800 text-white border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-accent"
            >
              <option value="normal">Normalna</option>
              <option value="bold">Boldovana</option>
            </select>
          </div>

          {/* Text Color */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Palette className="w-4 h-4" />
              Boja teksta
            </label>
            <div className="flex gap-3">
              <input
                type="color"
                value={settings.color}
                onChange={(e) => updateSetting('color', e.target.value)}
                className="w-16 h-10 rounded cursor-pointer bg-gray-800 border border-gray-700"
              />
              <input
                type="text"
                value={settings.color}
                onChange={(e) => updateSetting('color', e.target.value)}
                className="flex-1 bg-gray-800 text-white border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-accent"
                placeholder="#FFFFFF"
              />
            </div>
          </div>

          {/* Background Color */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Palette className="w-4 h-4" />
              Boja pozadine
            </label>
            <div className="flex gap-3">
              <input
                type="color"
                value={settings.backgroundColor}
                onChange={(e) => updateSetting('backgroundColor', e.target.value)}
                className="w-16 h-10 rounded cursor-pointer bg-gray-800 border border-gray-700"
              />
              <input
                type="text"
                value={settings.backgroundColor}
                onChange={(e) => updateSetting('backgroundColor', e.target.value)}
                className="flex-1 bg-gray-800 text-white border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-accent"
                placeholder="#000000"
              />
            </div>
          </div>

          {/* Background Opacity */}
          <div>
            <label className="flex items-center justify-between text-sm font-medium text-gray-300 mb-2">
              <span>Providnost pozadine</span>
              <span className="text-accent">{settings.backgroundOpacity}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={settings.backgroundOpacity}
              onChange={(e) => updateSetting('backgroundOpacity', parseInt(e.target.value))}
              className="w-full accent-accent"
            />
          </div>

          {/* Text Shadow */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Blend className="w-4 h-4" />
              Senka teksta
            </label>
            <select
              value={settings.textShadow}
              onChange={(e) => updateSetting('textShadow', e.target.value)}
              className="w-full bg-gray-800 text-white border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-accent"
            >
              {shadows.map(shadow => (
                <option key={shadow.value} value={shadow.value}>
                  {shadow.label}
                </option>
              ))}
            </select>
          </div>

          {/* Text Align */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <AlignCenter className="w-4 h-4" />
              Poravnanje teksta
            </label>
            <select
              value={settings.textAlign}
              onChange={(e) => updateSetting('textAlign', e.target.value)}
              className="w-full bg-gray-800 text-white border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-accent"
            >
              <option value="left">Levo</option>
              <option value="center">Centar</option>
              <option value="right">Desno</option>
            </select>
          </div>

          {/* Text Stroke */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-300">
              Ivica teksta (outline)
            </label>
            <button
              onClick={() => updateSetting('textStroke', !settings.textStroke)}
              className={`relative w-14 h-7 rounded-full transition ${
                settings.textStroke ? 'bg-accent' : 'bg-gray-700'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.textStroke ? 'translate-x-7' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex justify-between gap-4">
          <button
            onClick={resetSettings}
            className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition"
          >
            Resetuj na podrazumevano
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-accent text-white rounded hover:bg-accent/90 transition"
          >
            Primeni i zatvori
          </button>
        </div>
      </div>
    </div>
  );
}
