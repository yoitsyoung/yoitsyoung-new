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

  // Text rewrite typewriter effect
  document.querySelectorAll(".text-rewrite").forEach((link) => {
    const originalText = link.textContent.trim();
    const hoverText = link.getAttribute("data-hover") || "";
    
    // Wrap original text in a span
    link.innerHTML = `<span class="text-content">${originalText}</span><span class="text-hover"></span>`;
    
    const hoverSpan = link.querySelector(".text-hover");
    
    let isAnimating = false;
    let timeoutId = null;
    
    const typeWriter = (text, speed = 35) => {
      if (isAnimating) return;
      isAnimating = true;
      
      let i = 0;
      hoverSpan.textContent = "";
      
      const type = () => {
        if (i < text.length) {
          hoverSpan.textContent = text.substring(0, i + 1);
          
          // Measure width to set container width
          const temp = document.createElement("span");
          temp.style.visibility = "hidden";
          temp.style.position = "absolute";
          temp.style.font = window.getComputedStyle(link).font;
          temp.textContent = hoverSpan.textContent;
          document.body.appendChild(temp);
          const width = temp.offsetWidth;
          document.body.removeChild(temp);
          
          hoverSpan.style.width = `${width}px`;
          
          i++;
          // Add slight randomness for organic feel (20-50ms per character)
          timeoutId = setTimeout(type, speed + Math.random() * 30);
        } else {
          isAnimating = false;
        }
      };
      
      type();
    };
    
    const reverseTypeWriter = (speed = 25) => {
      if (isAnimating) return;
      isAnimating = true;
      
      const currentText = hoverSpan.textContent;
      let i = currentText.length;
      
      const reverse = () => {
        if (i >= 0) {
          hoverSpan.textContent = currentText.substring(0, i);
          
          // Measure width
          const temp = document.createElement("span");
          temp.style.visibility = "hidden";
          temp.style.position = "absolute";
          temp.style.font = window.getComputedStyle(link).font;
          temp.textContent = hoverSpan.textContent;
          document.body.appendChild(temp);
          const width = temp.offsetWidth;
          document.body.removeChild(temp);
          
          hoverSpan.style.width = `${width}px`;
          
          i--;
          timeoutId = setTimeout(reverse, speed);
        } else {
          hoverSpan.style.width = "0px";
          isAnimating = false;
        }
      };
      
      reverse();
    };
    
    link.addEventListener("mouseenter", () => {
      if (timeoutId) clearTimeout(timeoutId);
      hoverSpan.style.width = "0px";
      hoverSpan.textContent = "";
      setTimeout(() => {
        typeWriter(hoverText, 35);
      }, 50);
    });
    
    link.addEventListener("mouseleave", () => {
      if (timeoutId) clearTimeout(timeoutId);
      reverseTypeWriter(25);
    });
  });
});

