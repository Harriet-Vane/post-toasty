import { useState, useRef, type ImgHTMLAttributes, type CSSProperties } from "react";

type FlyingAngelProps = ImgHTMLAttributes<HTMLImageElement>;

/**
 * Renders the toast-angel image as three overlapping slices of the same PNG
 * (left wing / body / right wing) so we can animate only the wings.
 *
 * Clicking the angel triggers a slow, rhythmic wing flap and a gentle in-place
 * bob (modeled on the Dribbble "Flying Pig" loop) for a few seconds.
 */
export function FlyingAngel(props: FlyingAngelProps) {
  const {
    className = "",
    onClick,
    style,
    width,
    height,
    src,
    alt,
    title,
    loading,
    ...rest
  } = props;
  const [animating, setAnimating] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    onClick?.(e as unknown as React.MouseEvent<HTMLImageElement>);
    if (animating) return;
    setAnimating(true);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      setAnimating(false);
      timeoutRef.current = null;
    }, 5000);
  }

  const w = typeof width === "number" ? `${width}px` : width;
  const h = typeof height === "number" ? `${height}px` : height;

  const layerStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
  };

  return (
    <div
      onClick={handleClick}
      className={`${className} relative inline-block cursor-pointer select-none ${animating ? "angel-bob" : ""}`}
      style={{ ...style, width: w, height: h }}
      title={title}
      role="img"
      aria-label={typeof alt === "string" ? alt : undefined}
    >
      {/* Left wing slice (0% – 30% of width) */}
      <img
        {...rest}
        src={src}
        alt=""
        aria-hidden
        loading={loading}
        className={animating ? "angel-wing-left" : undefined}
        style={{ ...layerStyle, clipPath: "inset(0 70% 0 0)" }}
      />
      {/* Right wing slice (70% – 100% of width) */}
      <img
        {...rest}
        src={src}
        alt=""
        aria-hidden
        loading={loading}
        className={animating ? "angel-wing-right" : undefined}
        style={{ ...layerStyle, clipPath: "inset(0 0 0 70%)" }}
      />
      {/* Body slice (30% – 70% of width), rendered last so it sits on top */}
      <img
        {...rest}
        src={src}
        alt={alt}
        loading={loading}
        style={{ ...layerStyle, clipPath: "inset(0 30% 0 30%)" }}
      />
    </div>
  );
}

export default FlyingAngel;
