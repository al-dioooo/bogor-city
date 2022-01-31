// Declaration

const body = document.body;
const app = document.querySelector("#app");
const content = document.querySelector(".container");
const navbar = document.querySelector(".navbar");
const menu = document.querySelector(".menu");
const opener = document.querySelector(".menu-open");
const closer = document.querySelector(".menu-close");
const grain = document.querySelector(".grain");
const indonesiaLang = document.querySelector(".lang-id");
const englishLang = document.querySelector(".lang-en");
const links = document.querySelectorAll('a:not(.menu-open):not(.menu-close):not([target="_blank"])');
const anchor = document.querySelectorAll("a");
const pageTransition = document.querySelector(".page-transition");

let lang = window.localStorage.getItem("language");

var mouseX = window.innerWidth / 2;
var mouseY = window.innerHeight / 2;
var cursor = {
  el: document.querySelector(".cursor"),
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
  w: 40,
  h: 40,
  update: function () {
    l = this.x - this.w / 2;
    t = this.y - this.h / 2;
    this.el.style.transform = `translate3d(${l}px, ${t}px, 0)`;
  },
};

// Listeners

window.addEventListener("load", () => {
  initLanguage();
  loadContent();
});

opener.addEventListener("click", (e) => {
  e.preventDefault();
  openMenu();
});

closer.addEventListener("click", (e) => {
  e.preventDefault();
  closeMenu();
});

indonesiaLang.addEventListener("click", (e) => {
  if (lang == "id") {
    e.preventDefault();
  } else {
    changeLanguage("id");
  }
});

englishLang.addEventListener("click", (e) => {
  if (lang == "en") {
    e.preventDefault();
  } else {
    changeLanguage("en");
  }
});

document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;

  // var dx = li(e.clientX, x, 0.05);
  // var dy = li(e.clientY, y, 0.05);

  // dx = Math.floor(dx * 100) / 100;
  // dy = Math.floor(dy * 100) / 100;

  // cursor.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
});

// Functions

function li(a, b, n) {
  return (1 - n) * a + n * b;
}

function move() {
  cursor.x = li(cursor.x, mouseX, 0.15);
  cursor.y = li(cursor.y, mouseY, 0.15);
  cursor.update();
}

function openMenu() {
  // navbar.classList.remove("difference");
  menu.classList.add("showing");
  opener.style.display = "none";
  closer.style.display = "flex";
  body.style.overflow = "hidden";
  content.style.opacity = ".5";
  content.animate(
    [
      {
        transform: "translate3d(0, 10rem, 0)",
      },
    ],
    {
      duration: 1000,
      easing: "ease",
    }
  );
}

function closeMenu() {
  // navbar.classList.add("difference");
  menu.classList.remove("showing");
  opener.style.display = "flex";
  closer.style.display = "none";
  body.style.overflow = "auto";
  content.style.opacity = "1";
  content.animate(
    [
      {
        transform: "translate3d(0, 10rem, 0)",
      },
      {
        transform: "translate3d(0, 0, 0)",
      },
    ],
    {
      duration: 1000,
      easing: "ease",
    }
  );
}

function initLanguage() {
  const contents = document.querySelectorAll("[data-id]");

  if (!lang) {
    lang = "en";
    window.localStorage.setItem("language", lang);
  }

  if (lang == "id") {
    contents.forEach((content) => {
      content.innerHTML = content.getAttribute(`data-id`);
    });
  }
}

function changeLanguage(lang) {
  const contents = document.querySelectorAll("[data-id]");

  window.localStorage.setItem("language", lang);
}

function loadContent() {
  pageTransition.classList.add("loaded");
  body.style.overflow = "auto";

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      const target = link.href;

      // if (target.includes("html") && !target.includes("#")) {
      e.preventDefault();
      body.style.overflow = "hidden";
      pageTransition.classList.remove("loaded");
      // pageTransition.classList.add("unload");

      setInterval(() => {
        window.location.href = target;
      }, 500);
      // }
    });
  });
}

// Classes

class Grain {
  constructor(el) {
    /**
     * Options
     * Increase the pattern size if visible pattern
     */
    this.patternSize = 150;
    this.patternScaleX = 1;
    this.patternScaleY = 1;
    this.patternRefreshInterval = 3; // 8
    this.patternAlpha = 15; // int between 0 and 255,

    /**
     * Create canvas
     */
    this.canvas = el;
    this.ctx = this.canvas.getContext("2d");
    this.ctx.scale(this.patternScaleX, this.patternScaleY);

    /**
     * Create a canvas that will be used to generate grain and used as a
     * pattern on the main canvas.
     */
    this.patternCanvas = document.createElement("canvas");
    this.patternCanvas.width = this.patternSize;
    this.patternCanvas.height = this.patternSize;
    this.patternCtx = this.patternCanvas.getContext("2d");
    this.patternData = this.patternCtx.createImageData(
      this.patternSize,
      this.patternSize
    );
    this.patternPixelDataLength = this.patternSize * this.patternSize * 4; // RGBA

    /**
     * Prebind prototype function, so later its easier to user
     */
    this.resize = this.resize.bind(this);
    this.loop = this.loop.bind(this);

    this.frame = 0;

    window.addEventListener("resize", this.resize);
    this.resize();

    window.requestAnimationFrame(this.loop);
  }

  resize() {
    this.canvas.width = window.innerWidth * devicePixelRatio;
    this.canvas.height = window.innerHeight * devicePixelRatio;
  }

  update() {
    const { patternPixelDataLength, patternData, patternAlpha, patternCtx } =
      this;

    // Put a random shade of gray into every pixel of the pattern
    for (let i = 0; i < patternPixelDataLength; i += 4) {
      // Const value = (Math.random() * 255) | 0;
      const value = Math.random() * 255;

      patternData.data[i] = value;
      patternData.data[i + 1] = value;
      patternData.data[i + 2] = value;
      patternData.data[i + 3] = patternAlpha;
    }

    patternCtx.putImageData(patternData, 0, 0);
  }

  draw() {
    const { ctx, patternCanvas, canvas, viewHeight } = this;
    const { width, height } = canvas;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Fill the canvas using the pattern
    ctx.fillStyle = ctx.createPattern(patternCanvas, "repeat");
    ctx.fillRect(0, 0, width, height);
  }

  loop() {
    // Only update grain every 'n' frames
    const shouldDraw = ++this.frame % this.patternRefreshInterval === 0;
    if (shouldDraw) {
      this.update();
      this.draw();
    }

    window.requestAnimationFrame(this.loop);
  }
}

// Initialization
new Grain(grain);

anchor.forEach((link) => {
  link.addEventListener("mouseover", () => {
    cursor.el.classList.add("hover");
  });
  link.addEventListener("mouseleave", () => {
    cursor.el.classList.remove("hover");
  });
});

setInterval(move, 1000 / 60);
