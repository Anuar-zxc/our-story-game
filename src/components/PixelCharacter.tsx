"use client";

type PixelCharacterProps = {
  mood?: "soft" | "glitch" | "night" | "warm" | "danger";
};

export function PixelCharacter({ mood = "soft" }: PixelCharacterProps) {
  return (
    <div className={`pixel-character pixel-character-${mood}`} aria-hidden="true">
      <div className="pixel-shadow" />
      <div className="pixel-hair pixel-hair-back" />
      <div className="pixel-head">
        <div className="pixel-bang pixel-bang-left" />
        <div className="pixel-bang pixel-bang-right" />
        <div className="pixel-eye pixel-eye-left" />
        <div className="pixel-eye pixel-eye-right" />
        <div className="pixel-mouth" />
      </div>
      <div className="pixel-side-hair pixel-side-left" />
      <div className="pixel-side-hair pixel-side-right" />
      <div className="pixel-body">
        <div className="pixel-apron" />
        <div className="pixel-collar" />
      </div>
      <div className="pixel-arm pixel-arm-left" />
      <div className="pixel-arm pixel-arm-right" />
      <div className="pixel-leg pixel-leg-left" />
      <div className="pixel-leg pixel-leg-right" />
      <div className="pixel-sparkle pixel-sparkle-a" />
      <div className="pixel-sparkle pixel-sparkle-b" />
    </div>
  );
}
