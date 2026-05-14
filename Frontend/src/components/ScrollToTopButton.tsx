import { useEffect, useState, RefObject } from "react";
import { ArrowUp } from "lucide-react";

interface ScrollToTopButtonProps {
  targetRef?: RefObject<HTMLElement | null>;
  threshold?: number;
}

const ScrollToTopButton = ({ targetRef, threshold = 300 }: ScrollToTopButtonProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > threshold);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  const handleClick = () => {
    if (targetRef?.current) {
      targetRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Voltar ao topo"
      title="Voltar ao topo"
      className={`
        fixed bottom-6 right-6 z-50
        flex items-center gap-2
        rounded-full bg-primary px-4 py-2.5
        text-sm font-semibold text-primary-foreground
        shadow-lg shadow-primary/30
        transition-all duration-300 ease-in-out
        hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        ${visible ? "opacity-100 translate-y-0 pointer-events-auto border" : "opacity-0 translate-y-4 pointer-events-none"}
      `}
    >
      <ArrowUp className="w-4 h-4 shrink-0" />
      Voltar ao topo
    </button>
  );
};

export default ScrollToTopButton;
