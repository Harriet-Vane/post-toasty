import { useState, useRef, type ImgHTMLAttributes } from "react";

type FlyingAngelProps = ImgHTMLAttributes<HTMLImageElement>;

/**
 * Wraps the toast-angel image. Clicking it makes the angel flap its wings
 * and fly around the screen for a few seconds before settling back into place.
 */
export function FlyingAngel(props: FlyingAngelProps) {
  const { className = "", onClick, style, ...rest } = props;
  const [flying, setFlying] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  function handleClick(e: React.MouseEvent<HTMLImageElement>) {
    onClick?.(e);
    if (flying) return;
    setFlying(true);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      setFlying(false);
      timeoutRef.current = null;
    }, 7000);
  }

  return (
    <>
      {/* Hide the inline image while flying so the fixed overlay reads as "the same" angel */}
      <img
        {...rest}
        onClick={handleClick}
        className={`${className} cursor-pointer select-none`}
        style={{
          ...style,
          visibility: flying ? "hidden" : "visible",
        }}
      />
      {flying ? (
        <div
          aria-hidden="true"
          className="angel-flying-wrap pointer-events-none fixed left-1/2 top-1/2 z-[9999]"
        >
          <div className="angel-flying-bob">
            <img
              {...rest}
              aria-hidden="true"
              className="angel-flying-img"
              style={{
                width: rest.width,
                height: rest.height,
              }}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}

export default FlyingAngel;
