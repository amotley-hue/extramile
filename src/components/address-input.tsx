"use client";

import { useEffect, useId, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { cn } from "@/components/ui";

export interface PlaceValue {
  address: string;
  placeId?: string;
  isAirport?: boolean;
}

interface Suggestion {
  placeId: string;
  primary: string;
  secondary: string;
  description: string;
  isAirport: boolean;
}

/**
 * Address field with Google Places suggestions.
 *
 * Degrades to a plain text input when the Maps key is absent or the request
 * fails — the customer can always type an address and submit the request.
 */
export function AddressInput({
  label,
  value,
  onChange,
  placeholder,
  error,
  required,
}: {
  label: string;
  value: PlaceValue;
  onChange: (value: PlaceValue) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
}) {
  const id = useId();
  const listId = `${id}-list`;
  const errorId = `${id}-error`;

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const wrapperRef = useRef<HTMLDivElement>(null);
  /** Set when the user picks a suggestion, to suppress the refetch it triggers. */
  const justSelected = useRef(false);

  useEffect(() => {
    if (justSelected.current) {
      justSelected.current = false;
      return;
    }

    // Clearing on a too-short query happens in onChange, not here — resetting
    // state from inside an effect causes a second render pass for every
    // keystroke.
    const query = value.address.trim();
    if (query.length < 3) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/places?q=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );
        if (!response.ok) return;
        const data = (await response.json()) as { suggestions?: Suggestion[] };
        setSuggestions(data.suggestions ?? []);
        setOpen((data.suggestions ?? []).length > 0);
        setActive(-1);
      } catch {
        // Aborted or offline — leave the field as free text.
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value.address]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const select = (suggestion: Suggestion) => {
    justSelected.current = true;
    onChange({
      address: suggestion.description,
      placeId: suggestion.placeId,
      isAirport: suggestion.isAirport,
    });
    setOpen(false);
    setSuggestions([]);
    setActive(-1);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => (i + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (event.key === "Enter" && active >= 0) {
      event.preventDefault();
      select(suggestions[active]!);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <label
        htmlFor={id}
        className="mb-2.5 block text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-faint"
      >
        {label}
      </label>

      <div className="relative">
        <MapPin
          className="pointer-events-none absolute left-0 top-1/2 size-4 -translate-y-1/2 text-brass"
          strokeWidth={1.5}
          aria-hidden
        />
        <input
          id={id}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={
            active >= 0 ? `${listId}-option-${active}` : undefined
          }
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          autoComplete="off"
          required={required}
          value={value.address}
          placeholder={placeholder}
          onChange={(event) => {
            const next = event.target.value;
            // Typing invalidates the previously selected place.
            onChange({ address: next });
            if (next.trim().length < 3) {
              setSuggestions([]);
              setOpen(false);
            }
          }}
          onKeyDown={onKeyDown}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          className={cn(
            "w-full border-0 border-b bg-transparent py-3.5 pl-7 pr-0 text-[15px] text-cream placeholder:text-faint/70 transition-colors focus:ring-0",
            error
              ? "border-red-400/70"
              : "border-line-strong hover:border-brass/50 focus:border-brass",
          )}
        />
      </div>

      {error ? (
        <p id={errorId} className="mt-2.5 text-sm text-red-300">
          {error}
        </p>
      ) : null}

      {open && suggestions.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={`${label} suggestions`}
          className="absolute z-30 mt-1 max-h-72 w-full overflow-auto border border-line-strong bg-ink-raise/95 py-1.5 shadow-2xl shadow-black/70 backdrop-blur-xl"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.placeId}
              id={`${listId}-option-${index}`}
              role="option"
              aria-selected={index === active}
              onPointerDown={(event) => {
                event.preventDefault();
                select(suggestion);
              }}
              onMouseEnter={() => setActive(index)}
              className={cn(
                "cursor-pointer border-l-2 px-4 py-3 text-sm transition-colors",
                index === active
                  ? "border-brass bg-white/[0.04]"
                  : "border-transparent",
              )}
            >
              <span className="block text-cream">{suggestion.primary}</span>
              {suggestion.secondary ? (
                <span className="mt-0.5 block text-xs text-faint">
                  {suggestion.secondary}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
