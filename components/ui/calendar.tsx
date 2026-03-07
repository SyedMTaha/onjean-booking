import { useState, useEffect, useCallback } from "react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}
function toKey(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
function parseKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function formatLabel(from: string | null, to: string | null): string | null {
  if (!from || !to) return null;
  const a = parseKey(from);
  const b = parseKey(to);
  const nights = Math.round(Math.abs(b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
  const fmt = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`;
  return `${fmt(a)} – ${fmt(b)} | ${nights} night${nights !== 1 ? "s" : ""}`;
}

function ChevronLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
function ChevronRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

interface MonthGridProps {
  year: number;
  month: number;
  fromKey: string | null;
  toKeyProp: string | null;
  hoverKey: string | null;
  onDayClick: (key: string) => void;
  onDayHover: (key: string) => void;
}

function MonthGrid({ year, month, fromKey, toKeyProp, hoverKey, onDayClick, onDayHover }: MonthGridProps) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const cells = [];

  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const effectiveTo = toKeyProp || hoverKey;
  const [rangeFrom, rangeTo] =
    fromKey && effectiveTo
      ? fromKey <= effectiveTo
        ? [fromKey, effectiveTo]
        : [effectiveTo, fromKey]
      : [null, null];

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  // Tooltip positioning
  let tooltipWeekIdx = null;
  let tooltipColStart = 0;
  let tooltipColEnd = 6;

  if (rangeFrom && rangeTo && toKeyProp) {
    const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
    const cFrom = rangeFrom.startsWith(monthKey) ? parseInt(rangeFrom.split("-")[2]) : null;
    const cTo = rangeTo.startsWith(monthKey) ? parseInt(rangeTo.split("-")[2]) : null;

    if (cFrom !== null || cTo !== null) {
      const startDay = cFrom || 1;
      const endDay = cTo || daysInMonth;
      const midDay = Math.round((startDay + endDay) / 2);
      const midIdx = firstDay + midDay - 1;
      tooltipWeekIdx = Math.floor(midIdx / 7);
      tooltipColStart = cFrom ? (firstDay + startDay - 1) % 7 : 0;
      tooltipColEnd = cTo ? (firstDay + endDay - 1) % 7 : 6;
    }
  }

  const today = new Date(); today.setHours(0, 0, 0, 0);

  return (
    <div>
      {weeks.map((week, wi) => (
        <div key={wi} style={{ position: "relative" }}>
          {/* Range highlight strip */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(7, 1fr)",
            position: "absolute", inset: 0, pointerEvents: "none",
          }}>
            {week.map((day, ci) => {
              if (!day) return <div key={ci} />;
              const key = toKey(year, month, day);
              const inRange = rangeFrom && rangeTo && key > rangeFrom && key < rangeTo;
              return <div key={ci} style={{ background: inRange ? "#fff7ed" : "transparent", height: "100%" }} />;
            })}
          </div>

          {/* Tooltip */}
          {tooltipWeekIdx === wi && toKeyProp && (
            <div style={{
              position: "absolute", top: -2,
              left: `${(tooltipColStart / 7) * 100}%`,
              width: `${((tooltipColEnd - tooltipColStart + 1) / 7) * 100}%`,
              zIndex: 10, display: "flex", justifyContent: "center", pointerEvents: "none",
            }}>
              <div style={{
                background: "#3d3d3d", color: "#fff", borderRadius: 20,
                padding: "5px 14px", fontSize: 12.5, fontWeight: 500,
                whiteSpace: "nowrap", boxShadow: "0 4px 16px rgba(0,0,0,0.18)", marginTop: 4,
              }}>
                {formatLabel(rangeFrom, rangeTo)}
              </div>
            </div>
          )}

          {/* Day cells */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", position: "relative", zIndex: 1 }}>
            {week.map((day, ci) => {
              if (!day) return <div key={ci} style={{ height: 44 }} />;
              const key = toKey(year, month, day);
              const isFrom = key === rangeFrom;
              const isTo = key === rangeTo;
              const inRange = rangeFrom && rangeTo && key > rangeFrom && key < rangeTo;
              const isHovered = hoverKey === key;
              const isCircle = isFrom || isTo;
              const circleColor = isFrom ? "#3d3d3d" : "#f97316";
              const isPast = parseKey(key) < today;

              return (
                <div
                  key={ci}
                  onClick={() => !isPast && onDayClick(key)}
                  onMouseEnter={() => !isPast && onDayHover(key)}
                  style={{
                    height: 44, display: "flex", alignItems: "center",
                    justifyContent: "center", cursor: isPast ? "default" : "pointer",
                    position: "relative",
                    background: !isCircle && isHovered ? "#fff7ed" : "transparent",
                    borderRadius: 8,
                  }}
                >
                  {isCircle && (
                    <div style={{
                      position: "absolute", width: 34, height: 34,
                      borderRadius: "50%", background: circleColor, zIndex: 0,
                    }} />
                  )}
                  <span style={{
                    position: "relative", zIndex: 1, fontSize: 14,
                    fontWeight: isCircle ? 600 : 400,
                    color: isPast ? "#d1d5db" : isCircle ? "#fff" : inRange ? "#6b2b00" : "#1a1a1a",
                  }}>
                    {day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function App({
  externalFromKey,
  externalToKey,
  onDatesChange,
}: {
  externalFromKey?: string | null;
  externalToKey?: string | null;
  onDatesChange?: (from: string | null, to: string | null) => void;
} = {}) {
  const now = new Date();
  const [currentYear, setCurrentYear] = useState<number>(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(now.getMonth());
  const [fromKey, setFromKey] = useState<string | null>(null);
  const [toKeyState, setToKeyState] = useState<string | null>(null);
  const [hoverKey, setHoverKey] = useState<string | null>(null);
  const [selecting, setSelecting] = useState<boolean>(false);

  const isAtMin = currentYear === now.getFullYear() && currentMonth === now.getMonth();

  function prevMonth() {
    if (isAtMin) return;
    const d = new Date(currentYear, currentMonth - 1, 1);
    setCurrentYear(d.getFullYear());
    setCurrentMonth(d.getMonth());
  }

  function nextMonth() {
    const d = new Date(currentYear, currentMonth + 1, 1);
    setCurrentYear(d.getFullYear());
    setCurrentMonth(d.getMonth());
  }

  function handleDayClick(key: string) {
    if (!selecting) {
      setFromKey(key);
      setToKeyState(null);
      setHoverKey(null);
      setSelecting(true);
      onDatesChange?.(key, null);
    } else {
      if (key === fromKey) return;
      const [a, b] = key > (fromKey ?? "") ? [fromKey, key] : [key, fromKey];
      setFromKey(a);
      setToKeyState(b);
      setSelecting(false);
      setHoverKey(null);
      onDatesChange?.(a, b);
    }
  }

  function handleDayHover(key: string) {
    setHoverKey(key);
  }

  // Use external keys if provided (for wrapper integration)
  const currentFromKey = externalFromKey !== undefined ? externalFromKey : fromKey;
  const currentToKey = externalToKey !== undefined ? externalToKey : toKeyState;

  const label: string | null = currentToKey
    ? formatLabel(
        (currentFromKey ?? "") <= currentToKey ? currentFromKey : currentToKey,
        (currentFromKey ?? "") <= currentToKey ? currentToKey : currentFromKey
      )
    : null;

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif",

    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .nav-btn {
          width: 32px; height: 32px; border-radius: 50%;
          border: 1px solid #e5e7eb; background: #fff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #374151;
          transition: background 0.15s, border-color 0.15s, color 0.15s;
          outline: none;
        }
        .nav-btn:hover:not([disabled]) {
          background: #fff7f0; border-color: #f97316; color: #f97316;
        }
        .nav-btn[disabled] { opacity: 0.25; cursor: default; pointer-events: none; }
        .clear-btn {
          margin-top: 12px; background: none; border: 1px solid #e5e5e5;
          border-radius: 8px; padding: 7px 20px; font-size: 12px; color: #9ca3af;
          cursor: pointer; font-family: inherit; transition: border-color 0.15s, color 0.15s;
        }
        .clear-btn:hover { border-color: #f97316; color: #f97316; }
      `}</style>

      {/* Status bar - hidden in modal context */}
      <div style={{
        background: "#fff", borderRadius: 12, padding: "10px 24px", marginBottom: 8,
        fontSize: 13,
        color: selecting ? "#f97316" : label ? "#1a1a1a" : "#9ca3af",
        fontWeight: 500, boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
        minWidth: 300, textAlign: "center",
        transition: "color 0.2s",
        display: externalFromKey !== undefined ? "none" : "block",
      }}>
        {selecting ? "Select check-out date" : label ? `✓ ${label}` : "Select check-in date"}
      </div>

      {/* Calendar card */}
      <div
        onMouseLeave={() => setHoverKey(null)}
        style={{
          background: "#fff", borderRadius: 16, width: 340,
          boxShadow: "0 2px 20px rgba(0,0,0,0.08)", overflow: "hidden",
        }}
      >
        {/* ── Header with nav ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 20px 14px",
          borderBottom: "1px solid #f3f3f3",
        }}>
          <button className="nav-btn" onClick={prevMonth} disabled={isAtMin}>
            <ChevronLeft />
          </button>

          <span style={{ fontWeight: 700, fontSize: 15, color: "#1a1a1a", letterSpacing: "-0.01em" }}>
            {MONTHS[currentMonth]} {currentYear}
          </span>

          <button className="nav-btn" onClick={nextMonth}>
            <ChevronRight />
          </button>
        </div>

        {/* Day-of-week headers */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(7, 1fr)",
          padding: "10px 20px 4px",
        }}>
          {DAYS.map(d => (
            <div key={d} style={{
              textAlign: "center", fontSize: 12, fontWeight: 500, color: "#9ca3af",
            }}>{d}</div>
          ))}
        </div>

        {/* Month grid */}
        <div style={{ padding: "0 20px 16px" }}>
          <MonthGrid
            year={currentYear}
            month={currentMonth}
            fromKey={currentFromKey}
            toKeyProp={currentToKey}
            hoverKey={hoverKey}
            onDayClick={handleDayClick}
            onDayHover={handleDayHover}
          />
        </div>
      </div>

      {/* Clear */}
      {(fromKey || toKeyState) && (
        <button
          className="clear-btn"
          onClick={() => { setFromKey(null); setToKeyState(null); setHoverKey(null); setSelecting(false); }}
        >
          Clear dates
        </button>
      )}
    </div>
  );
}

export function Calendar({
  mode,
  selected,
  onSelect,
  disabled,
  numberOfMonths,
  initialFocus,
}: {
  mode?: string;
  selected?: { from?: Date; to?: Date };
  onSelect?: (range: any) => void;
  disabled?: (date: Date) => boolean;
  numberOfMonths?: number;
  initialFocus?: boolean;
}) {
  const [fromKey, setFromKey] = useState<string | null>(null);
  const [toKeyState, setToKeyState] = useState<string | null>(null);

  // Sync selected dates from parent if provided
  useEffect(() => {
    if (selected?.from) {
      const from = selected.from;
      const fromKeyStr = `${from.getFullYear()}-${String(from.getMonth() + 1).padStart(2, "0")}-${String(from.getDate()).padStart(2, "0")}`;
      setFromKey(fromKeyStr);
    } else {
      setFromKey(null);
    }
  }, [selected?.from]);

  useEffect(() => {
    if (selected?.to) {
      const to = selected.to;
      const toKeyStr = `${to.getFullYear()}-${String(to.getMonth() + 1).padStart(2, "0")}-${String(to.getDate()).padStart(2, "0")}`;
      setToKeyState(toKeyStr);
    } else {
      setToKeyState(null);
    }
  }, [selected?.to]);

  // Notify parent when dates change
  const handleDatesChange = useCallback((from: string | null, to: string | null) => {
    if (from || to) {
      const fromDate = from ? parseKey(from) : undefined;
      const toDate = to ? parseKey(to) : undefined;
      onSelect?.({
        from: fromDate,
        to: toDate,
      });
    }
  }, [onSelect]);

  return (
    <App
      externalFromKey={fromKey}
      externalToKey={toKeyState}
      onDatesChange={handleDatesChange}
    />
  );
}