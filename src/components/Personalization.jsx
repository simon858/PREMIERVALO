import { useState, useEffect, useRef } from 'react';
import { THEME_PRESETS, DEFAULT_THEME } from '../utils/constants';
import { applyTheme } from '../utils/helpers';
import { STORAGE_KEYS } from '../utils/storage';

const Personalization = () => {
  const [open, setOpen]       = useState(false);
  const [current, setCurrent] = useState(() => localStorage.getItem(STORAGE_KEYS.themeColor) || DEFAULT_THEME);
  const wrapperRef = useRef(null);

  useEffect(() => {
    applyTheme(current);
  }, [current]);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const handleApply = (hex) => {
    setCurrent(hex);
    applyTheme(hex);
  };

  const handleHexInput = (val) => {
    val = val.trim();
    if (!val.startsWith('#')) val = '#' + val;
    if (/^#[0-9a-fA-F]{6}$/.test(val)) handleApply(val);
  };

  return (
    <div className="persona-wrapper" ref={wrapperRef} style={{ position: 'relative' }}>
      <button
        className={`persona-btn${open ? ' open' : ''}`}
        title="Personalization"
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
      />
      <div className={`persona-panel${open ? ' open' : ''}`}>
        <div className="persona-panel-title">Personalization</div>
        <div className="persona-swatches">
          {THEME_PRESETS.map((p) => (
            <button
              key={p.hex}
              className={`persona-swatch${current.toLowerCase() === p.hex.toLowerCase() ? ' active' : ''}`}
              data-hex={p.hex}
              title={p.name}
              style={{ background: p.hex }}
              onClick={() => handleApply(p.hex)}
            />
          ))}
        </div>
        <div className="persona-divider" />
        <div className="persona-custom-label">Custom Color</div>
        <div className="persona-custom-row">
          <div className="persona-color-input-wrap" style={{ background: current }}>
            <input
              type="color"
              value={current}
              onChange={(e) => handleApply(e.target.value)}
            />
          </div>
          <input
            type="text"
            className="persona-hex-input"
            placeholder="#e8ff00"
            maxLength={7}
            defaultValue={current}
            key={current}
            onChange={(e) => handleHexInput(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default Personalization;
