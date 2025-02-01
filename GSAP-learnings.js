// Version 10.4 - Final Version - All Code, Comments (JSDoc Included), and Formatting Corrected (self added to gsap.context - ALL code restored)

import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Creates an Intersection Observer to detect when a target element intersects with its root.
 */
class Intersect {
  /**
   * @param {string} target - The CSS selector for the element to observe.
   * @param {function} callback - The function to call when the target intersects.
   * @param {object} options - Options for the Intersection Observer.
   */
  constructor(target, callback, options = {}) {
    this.target = target;
    this.callback = callback;
    this.observer = new IntersectionObserver(this.handleIntersect.bind(this), options);
  }

  /**
   * Handles the intersection event.
   * @param {array} entries - An array of Intersection Observer Entry objects.
   */
  handleIntersect(entries) {
    if (entries[0].isIntersecting) {
      this.observer.unobserve(document.querySelector(this.target));
      try {
        this.callback();
      } catch (error) {
        console.error("Error in IntersectionObserver callback:", error);
      }
    }
  }

  /**
   * Starts observing the target element.
   */
  start() {
    const element = document.querySelector(this.target);
    if (element) {
      this.observer.observe(element);
    } else {
      console.error(`Target element with selector '${this.target}' not found.`);
    }
  }

  /**
   * Stops observing the target element.
   */
  stop() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

/**
 * Manages ScrollTriggers for a set of panels within a container.
 */
class Scroller {
  /**
   * @param {string} container - The CSS selector for the container element.
   * @param {string} panel - The CSS selector for the panel elements.
   */
  constructor(container, panel) {
    this.container = container;
    this.panel = panel;
    this.triggers = [];
    this.mm = gsap.matchMedia();
    this.current = null;
  }

  /**
   * Creates ScrollTriggers for the panels based on media query.
   * @param {object} context - The GSAP context.
   */
  create(context) {
    if (this.current) {
      this.mm.remove(this.current);
      this.current = null;
    }

    this.current = this.mm.add("(min-width: 1024px)", () => {
      const containerEl = document.querySelector(this.container);
      if (!containerEl) {
        console.error(`Container with selector '${this.container}' not found.`);
        return;
      }

      const panels = gsap.utils.toArray(containerEl.querySelectorAll(this.panel));

      if (panels.length === 0) {
        console.warn(`No elements with selector '${this.panel}' found within the container. Animations disabled.`);
        return;
      }

      panels.forEach((panel, i) => {
        const targetY = -window.innerHeight * i;

        const st = ScrollTrigger.create({
          trigger: panel,
          pin: true,
          scrub: true,
          start: "top top",
          end: "bottom top",
          animation: gsap.to(panel, { y: targetY, ease: "none" }),
          onEnter: () => console.log(`Panel ${i + 1} entered`),
          onLeave: () => console.log(`Panel ${i + 1} left`),
        });
        this.triggers.push(st);
      });

      return () => {
        this.triggers.forEach(st => st.kill());
        this.triggers = [];
        ScrollTrigger.refresh();
      };
    });
  }

  /**
   * Kills all ScrollTriggers and reverts matchMedia.
   */
  kill() {
    if (this.current) {
      this.mm.remove(this.current);
      this.current = null;
    }
    this.mm.revert();
    this.triggers = [];
  }
}

/**
 * Manages the panel animations.
 */
class PanelAnim {
  /**
   * @param {string} container - The CSS selector for the container element.
   * @param {string} panel - The CSS selector for the panel elements.
   */
  constructor(container, panel) {
    this.scroller = new Scroller(container, panel);
    this.context = null;
    this.initialized = false;
  }

  /**
   * Initializes the panel animations.
   * @returns {Promise<void>}
   */
  async init() {
    if (this.initialized) {
      return;
    }

    try {
      const [gsap, ScrollTrigger] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]).catch(error => {
        console.error("Error loading GSAP or ScrollTrigger:", error);
        return [null, null];
      });

      if (!gsap || !ScrollTrigger) {
        console.error("One or both libraries failed to load.");
        return;
      }

      gsap.registerPlugin(ScrollTrigger.default);

      this.context = gsap.context(() => {
        this.scroller.create(this.context);
      }, self); // Added 'self' here

      this.initialized = true;

    } catch (error) {
      console.error("Error in PanelAnimation.init:", error);
    }
  }

  /**
   * Destroys the panel animations.
   */
  destroy() {
    if (this.context) {
      this.context.revert();
      this.context = null;
    }

    this.scroller.kill();

    this.initialized = false;
  }
}

// Usage (ES6 Modules - you'll need a build process):
document.addEventListener('DOMContentLoaded', () => {
  const panelAnim = new PanelAnim(".panel-container", ".panel");

  const options = {
    root: document.querySelector("#scrollArea"),
    rootMargin: "0px",
    threshold: 1.0,
  };

  const intersect = new Intersect('.intersection-observer-target', async () => {
    await panelAnim.init();
  }, options);

  intersect.start();

  // *** Usage Examples (Restored and with Comments) ***

  // 1. Direct Instantiation (For more control):
  // const myAnimation = new PanelAnim('.another-container', '.another-panel');
  // myAnimation.init();

  // 2. On a Specific Route (Using a hypothetical router):
  // router.on('/animations', async () => {
  //   const myAnimation = new PanelAnim('.another-container', '.another-panel');
  //   await myAnimation.init();
  // });

  // 3. On User Interaction (e.g., Button Click):
  // const animateButton = document.getElementById('animate-button');
  // if (animateButton) {
  //   animateButton.addEventListener('click', async () => {
  //     const myAnimation = new PanelAnim('.another-container', '.another-panel');
  //     await myAnimation.init();
  //   });
  // }

  // 4. After Initial Page Load (Less critical animations):
  // window.addEventListener('load', async () => {
  //   const myAnimation = new PanelAnim('.another-container', '.another-panel');
  //   await myAnimation.init();
  // });

  // 5. DOMContentLoaded initialization (Alternative - less ideal with IntersectionObserver):
  // const myAnimation = new PanelAnim('.another-container', '.another-panel');
  // document.addEventListener('DOMContentLoaded', () => {
  //   myAnimation.init();
  // });