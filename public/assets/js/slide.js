document.addEventListener("DOMContentLoaded", function () {
  const lerp = (f0, f1, t) => (1 - t) * f0 + t * f1;
  const clamp = (val, min, max) => Math.max(min, Math.min(val, max));

  class DragScroll {
    constructor(obj) {
      this.$el = document.querySelector(obj.el);
      this.$wrap = this.$el.querySelector(obj.wrap);
      this.$items = this.$el.querySelectorAll(obj.item);
      this.init();
    }

    init() {
      this.progress = 0;
      this.speed = 0;
      this.oldX = 0;
      this.x = 0;
      this.playrate = 0;
      //
      this.bindings();
      this.events();
      this.calculate();
      this.raf();
    }

    bindings() {
      [
        "events",
        "calculate",
        "raf",
        "handleWheel",
        "move",
        "raf",
        "handleTouchStart",
        "handleTouchMove",
        "handleTouchEnd",
      ].forEach((i) => {
        this[i] = this[i].bind(this);
      });
    }

    calculate() {
      this.progress = 0;
      this.wrapWidth = this.$items[0].clientWidth * this.$items.length;
      // this.$wrap.style.width = `${this.wrapWidth}px`;

      if (this.wrapWidth - this.$el.clientWidth < 500) {
        this.maxScroll = this.wrapWidth * 1.5 - this.$el.clientWidth;
      } else {
        this.maxScroll = this.wrapWidth - this.$el.clientWidth;
      }
    }

    handleWheel(e) {
      this.progress += e.deltaY;
      this.move();
    }

    handleTouchStart(e) {
      e.preventDefault();
      this.dragging = true;
      this.startX = e.clientX || e.touches[0].clientX;
      this.$el.classList.add("dragging");
    }

    handleTouchMove(e) {
      if (!this.dragging) return false;
      const x = e.clientX || e.touches[0].clientX;
      this.progress += (this.startX - x) * 2.5;
      this.startX = x;
      this.move();
    }

    handleTouchEnd() {
      this.dragging = false;
      this.$el.classList.remove("dragging");
    }

    move() {
      this.progress = clamp(this.progress, 0, this.maxScroll);
    }

    events() {
      window.addEventListener("resize", this.calculate);

      this.$el.addEventListener("touchstart", this.handleTouchStart);
      window.addEventListener("touchmove", this.handleTouchMove);
      window.addEventListener("touchend", this.handleTouchEnd);

      this.$el.addEventListener("mousedown", this.handleTouchStart);
      window.addEventListener("mousemove", this.handleTouchMove);
      window.addEventListener("mouseup", this.handleTouchEnd);
      document.body.addEventListener("mouseleave", this.handleTouchEnd);
    }

    raf() {
      this.x = lerp(this.x, this.progress, 0.1);
      this.playrate = this.x / this.maxScroll;
      this.$wrap.style.transform = `translateX(${-this.x}px)`;
      this.speed = Math.min(100, this.oldX - this.x);
      this.oldX = this.x;
    }
  }

  const slideContent = document.querySelector(".slide-content");

  if (slideContent) {
    const scroll = new DragScroll({
      el: ".slide-content",
      wrap: ".slide-container",
      item: ".slide-item",
    });

    const raf = () => {
      requestAnimationFrame(raf);
      scroll.raf();
    };
    raf();
  }
});
