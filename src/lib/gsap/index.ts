import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

// Register plugins once — they must be registered before use
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// Default ease used site-wide for a premium feel
gsap.defaults({
  ease: "power3.out",
  duration: 0.9,
});

export { gsap, ScrollTrigger };
