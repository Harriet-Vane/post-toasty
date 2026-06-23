import angelToast from "@/assets/angel-toast.png";

export function ToastAngel({
  width = 64,
  height = 64,
  title,
  className,
}: {
  width?: number;
  height?: number;
  title?: string;
  className?: string;
}) {
  return (
    <img
      src={angelToast}
      alt="Toast Angel"
      title={title}
      width={width}
      height={height}
      className={className}
      style={{ imageRendering: "pixelated" }}
    />
  );
}
