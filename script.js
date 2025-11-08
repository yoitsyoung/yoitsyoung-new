document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".hover-inline").forEach((item) => {
    const img = item.querySelector(".hover-image");
    if (!img) return;

    let baseX = 0;
    let baseY = 0;

    const handleMove = (event) => {
      img.style.transform = `translate(${baseX + event.offsetX * 0.1}px, ${
        baseY + event.offsetY * 0.1
      }px)`;
    };

    const handleEnter = () => {
      const computedStyle = window.getComputedStyle(img);
      const matrix = new DOMMatrix(computedStyle.transform);
      baseX = matrix.m41;
      baseY = matrix.m42;

      item.addEventListener("mousemove", handleMove);
    };

    const handleLeave = () => {
      item.removeEventListener("mousemove", handleMove);
      img.style.transform = "";
    };

    item.addEventListener("mouseenter", handleEnter);
    item.addEventListener("mouseleave", handleLeave);
  });
});

