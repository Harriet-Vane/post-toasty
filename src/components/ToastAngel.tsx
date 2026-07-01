import { useCallback, useState } from "react";
import angelToast from "@/assets/angel-toast.png";
import { FlyingToasters } from "@/components/FlyingToasters";

type Props = {
  width?: number;
  height?: number;
  className?: string;
  title?: string;
  loading?: "lazy" | "eager";
};

export function ToastAngel({
  width = 96,
  height = 96,
  className = "opacity-80",
  title,
  loading = "lazy",
}: Props) {
  const [flying, setFlying] = useState(false);

  const handleClick = useCallback(() => {
    setFlying(true);
  }, []);

  return (
    <>
      <img
        src={angelToast}
        alt="Angel toast"
        title={title}
        width={width}
        height={height}
        className={`${className} cursor-pointer select-none`}
        loading={loading}
        draggable={false}
        onClick={handleClick}
      />
      {flying && <FlyingToasters onDone={() => setFlying(false)} />}
    </>
  );
}
