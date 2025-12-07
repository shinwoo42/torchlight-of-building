"use client";

import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { useMemo, useRef, useState } from "react";

export interface SearchableSelectOption<T = string> {
  value: T;
  label: string;
  sublabel?: string;
}

interface SearchableSelectProps<T extends string | number> {
  value: T | undefined;
  onChange: (value: T | undefined) => void;
  options: SearchableSelectOption<T>[];
  placeholder?: string;
  size?: "sm" | "default" | "lg";
  disabled?: boolean;
  className?: string;
  renderOption?: (
    option: SearchableSelectOption<T>,
    props: { active: boolean; selected: boolean },
  ) => React.ReactNode;
  renderSelectedTooltip?: (
    option: SearchableSelectOption<T>,
    triggerRect: DOMRect,
  ) => React.ReactNode;
}

const SIZE_CLASSES = {
  sm: "px-2 py-1 text-xs",
  default: "px-3 py-2 text-sm",
  lg: "px-4 py-2 text-sm",
} as const;

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

export const SearchableSelect = <T extends string | number>({
  value,
  onChange,
  options,
  placeholder = "Select...",
  size = "default",
  disabled = false,
  className = "",
  renderOption,
  renderSelectedTooltip,
}: SearchableSelectProps<T>) => {
  const [query, setQuery] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [inputRect, setInputRect] = useState<DOMRect | undefined>(undefined);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputWrapperRef = useRef<HTMLDivElement>(null);

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value],
  );

  const filteredOptions = useMemo(() => {
    if (!query) return options;
    const lowerQuery = query.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(lowerQuery) ||
        opt.sublabel?.toLowerCase().includes(lowerQuery),
    );
  }, [options, query]);

  const handleChange = (option: SearchableSelectOption<T> | null) => {
    onChange(option?.value);
    setQuery("");
  };

  const isEmpty = value === undefined || value === "";

  return (
    <Combobox
      value={selectedOption ?? null}
      onChange={handleChange}
      disabled={disabled}
    >
      <div className={`relative ${className}`}>
        <div
          ref={inputWrapperRef}
          className="relative"
          onMouseEnter={() => {
            setIsHovered(true);
            if (inputWrapperRef.current) {
              setInputRect(inputWrapperRef.current.getBoundingClientRect());
            }
          }}
          onMouseLeave={() => setIsHovered(false)}
        >
          <ComboboxInput
            className={`
              w-full bg-zinc-800 border border-zinc-700 rounded
              ${SIZE_CLASSES[size]}
              focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500
              ${isEmpty ? "text-zinc-500" : "text-zinc-50"}
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            `}
            displayValue={(opt: SearchableSelectOption<T> | null) =>
              opt?.label ?? ""
            }
            onChange={(e) => setQuery(e.target.value)}
            onClick={() => buttonRef.current?.click()}
            placeholder={placeholder}
          />
          <ComboboxButton
            ref={buttonRef}
            className="absolute inset-y-0 right-0 flex items-center pr-2"
          >
            <ChevronDownIcon className="h-4 w-4 text-zinc-400" />
          </ComboboxButton>
        </div>

        <ComboboxOptions
          anchor="bottom start"
          className="
            w-[var(--input-width)] z-50 mt-1 max-h-60 overflow-auto rounded
            bg-zinc-800 border border-zinc-700 shadow-lg
            focus:outline-none
          "
        >
          <ComboboxOption
            value={null}
            className={({ active }) => `
              ${SIZE_CLASSES[size]} cursor-pointer text-zinc-500
              ${active ? "bg-zinc-700" : ""}
            `}
          >
            {placeholder}
          </ComboboxOption>

          {filteredOptions.length === 0 && query !== "" ? (
            <div className={`${SIZE_CLASSES[size]} text-zinc-500`}>
              No results found
            </div>
          ) : (
            filteredOptions.map((option) => (
              <ComboboxOption
                key={String(option.value)}
                value={option}
                className={({ active, selected }) => `
                  ${SIZE_CLASSES[size]} cursor-pointer
                  ${active ? "bg-zinc-700" : ""}
                  ${selected ? "text-amber-400" : "text-zinc-50"}
                `}
              >
                {({ active, selected }) => (
                  <div>
                    {renderOption ? (
                      renderOption(option, { active, selected })
                    ) : (
                      <>
                        <span>{option.label}</span>
                        {option.sublabel && (
                          <span className="text-zinc-500 ml-2 text-xs">
                            {option.sublabel}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                )}
              </ComboboxOption>
            ))
          )}
        </ComboboxOptions>

        {renderSelectedTooltip &&
          selectedOption &&
          isHovered &&
          inputRect &&
          renderSelectedTooltip(selectedOption, inputRect)}
      </div>
    </Combobox>
  );
};
