document.addEventListener("DOMContentLoaded", () => {
  // Trigger white-to-dark transition after a brief delay to show initial white state
  setTimeout(() => {
    document.body.classList.add("loaded");
  }, 300);
  
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
    
    link.addEventListener("mouseenter", (e) => {
      // Skip text rewrite if this is the projects trigger and showcase is active/opening
      if (link.classList.contains("projects-trigger")) {
        const showcase = document.querySelector(".projects-showcase");
        if (showcase && showcase.classList.contains("active")) {
          return;
        }
      }
      
      if (timeoutId) clearTimeout(timeoutId);
      hoverSpan.style.width = "0px";
      hoverSpan.textContent = "";
      setTimeout(() => {
        typeWriter(hoverText, 35);
      }, 50);
    });
    
    link.addEventListener("mouseleave", (e) => {
      // Skip text rewrite if this is the projects trigger and showcase is active/opening
      if (link.classList.contains("projects-trigger")) {
        const showcase = document.querySelector(".projects-showcase");
        if (showcase && showcase.classList.contains("active")) {
          return;
        }
      }
      
      if (timeoutId) clearTimeout(timeoutId);
      reverseTypeWriter(25);
    });
  });

  // Load and render blog posts from JSON
  async function loadBlogPosts() {
    const container = document.querySelector(".blog-posts-container");
    if (!container) {
      console.warn('Blog posts container not found');
      return;
    }
    
    try {
      console.log('Loading blog posts from blog.json...');
      const response = await fetch('./blog.json');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const posts = data.posts;
      
      if (!posts || !Array.isArray(posts)) {
        throw new Error('Invalid blog posts data format');
      }
      
      console.log(`Loaded ${posts.length} blog posts`);
      
      // Clear container
      container.innerHTML = '';
      
      // Generate blog post items
      posts.forEach((post) => {
        const postItem = document.createElement('a');
        postItem.className = 'blog-post-item';
        postItem.href = post.url;
        postItem.target = '_blank';
        postItem.rel = 'noopener noreferrer';
        
        const title = document.createElement('span');
        title.className = 'blog-post-title';
        title.textContent = post.title;
        
        const date = document.createElement('span');
        date.className = 'blog-post-date';
        date.textContent = post.date;
        
        postItem.appendChild(title);
        postItem.appendChild(date);
        container.appendChild(postItem);
      });
      
      console.log('Blog posts loaded and rendered successfully');
    } catch (error) {
      console.error('Error loading blog posts:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
      // Show a fallback message
      if (container) {
        container.innerHTML = '<div style="color: var(--text-secondary); padding: 20px;">Failed to load blog posts. Please check the console for details.</div>';
      }
    }
  }

  // Blog showcase toggle with content transformation
  const blogTrigger = document.querySelector(".blog-trigger");
  const blogShowcase = document.querySelector(".blog-showcase");
  const section = document.querySelector(".section");
  
  if (blogTrigger && blogShowcase && section) {
    let hoverTimeout = null;
    let leaveTimeout = null;
    
    const showBlogShowcase = () => {
      if (leaveTimeout) {
        clearTimeout(leaveTimeout);
        leaveTimeout = null;
      }
      // Close projects if open
      section.classList.remove("projects-active");
      document.querySelector(".projects-showcase")?.classList.remove("active");
      section.classList.add("blog-active");
      blogShowcase.classList.add("active");
    };
    
    const hideBlogShowcase = () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        hoverTimeout = null;
      }
      leaveTimeout = setTimeout(() => {
        section.classList.remove("blog-active");
        blogShowcase.classList.remove("active");
      }, 200);
    };
    
    blogTrigger.addEventListener("mouseenter", () => {
      hoverTimeout = setTimeout(showBlogShowcase, 300);
    });
    
    blogTrigger.addEventListener("mouseleave", hideBlogShowcase);
    
    // Keep showcase open when hovering over it
    blogShowcase.addEventListener("mouseenter", () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        hoverTimeout = null;
      }
      if (leaveTimeout) {
        clearTimeout(leaveTimeout);
        leaveTimeout = null;
      }
      section.classList.add("blog-active");
      blogShowcase.classList.add("active");
    });
    
    blogShowcase.addEventListener("mouseleave", () => {
      section.classList.remove("blog-active");
      blogShowcase.classList.remove("active");
    });
  }

  // Projects showcase toggle with content transformation
  const projectsTrigger = document.querySelector(".projects-trigger");
  const projectsShowcase = document.querySelector(".projects-showcase");
  let projectsLoaded = false;
  let projectsLoading = false;
  
  if (projectsTrigger && projectsShowcase && section) {
    let hoverTimeout = null;
    let leaveTimeout = null;
    let isShowing = false;
    let isHiding = false;
    let lastMouseEnterTime = 0;
    let lastMouseLeaveTime = 0;
    const DEBOUNCE_DELAY = 100; // Minimum time between events
    
    const showProjectsShowcase = () => {
      // Prevent multiple simultaneous calls
      if (isShowing || projectsShowcase.classList.contains("active")) {
        return;
      }
      
      isShowing = true;
      if (leaveTimeout) {
        clearTimeout(leaveTimeout);
        leaveTimeout = null;
        isHiding = false;
      }
      // Close blog if open
      section.classList.remove("blog-active");
      document.querySelector(".blog-showcase")?.classList.remove("active");
      section.classList.add("projects-active");
      projectsShowcase.classList.add("active");
      
      // Load projects if not already loaded
      if (!projectsLoaded && !projectsLoading) {
        projectsLoading = true;
        loadProjects().then(() => {
          projectsLoaded = true;
          projectsLoading = false;
        }).catch(() => {
          projectsLoading = false;
        });
      }
      
      // Reset flag after animation completes
      setTimeout(() => {
        isShowing = false;
      }, 600);
    };
    
    const hideProjectsShowcase = () => {
      // Prevent multiple simultaneous calls
      if (isHiding || !projectsShowcase.classList.contains("active")) {
        return;
      }
      
      // Don't hide if projects are still loading
      if (projectsLoading) {
        return;
      }
      
      // Don't hide if there are no projects loaded yet
      const container = projectsShowcase.querySelector(".projects-container");
      if (container && container.querySelectorAll(".project-item").length === 0) {
        return;
      }
      
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        hoverTimeout = null;
      }
      
      isHiding = true;
      leaveTimeout = setTimeout(() => {
        if (isHiding) { // Double check we're still hiding
          section.classList.remove("projects-active");
          projectsShowcase.classList.remove("active");
          isHiding = false;
        }
      }, 200);
    };
    
    projectsTrigger.addEventListener("mouseenter", (e) => {
      e.stopPropagation();
      const now = Date.now();
      
      // Debounce: ignore if too soon after last leave
      if (now - lastMouseLeaveTime < DEBOUNCE_DELAY) {
        return;
      }
      
      lastMouseEnterTime = now;
      
      if (!isShowing && !projectsShowcase.classList.contains("active") && !isHiding) {
        if (hoverTimeout) {
          clearTimeout(hoverTimeout);
        }
        hoverTimeout = setTimeout(showProjectsShowcase, 300);
      }
    }, { passive: true });
    
    projectsTrigger.addEventListener("mouseleave", (e) => {
      e.stopPropagation();
      const now = Date.now();
      
      // Debounce: ignore if too soon after last enter
      if (now - lastMouseEnterTime < DEBOUNCE_DELAY) {
        return;
      }
      
      lastMouseLeaveTime = now;
      
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        hoverTimeout = null;
      }
      
      // Check if mouse is moving to showcase area
      const relatedTarget = e.relatedTarget;
      if (relatedTarget && projectsShowcase.contains(relatedTarget)) {
        return; // Mouse is moving to showcase, don't hide
      }
      
      hideProjectsShowcase();
    }, { passive: true });
    
    // Keep showcase open when hovering over it
    projectsShowcase.addEventListener("mouseenter", (e) => {
      e.stopPropagation();
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        hoverTimeout = null;
      }
      if (leaveTimeout) {
        clearTimeout(leaveTimeout);
        leaveTimeout = null;
        isHiding = false;
      }
      if (!isShowing) {
        section.classList.add("projects-active");
        projectsShowcase.classList.add("active");
      }
    }, { passive: true });
    
    projectsShowcase.addEventListener("mouseleave", (e) => {
      e.stopPropagation();
      
      // Check if mouse is moving to trigger
      const relatedTarget = e.relatedTarget;
      if (relatedTarget && projectsTrigger.contains(relatedTarget)) {
        return; // Mouse is moving to trigger, don't hide
      }
      
      hideProjectsShowcase();
    }, { passive: true });
  }

  // Load and render projects from JSON
  async function loadProjects() {
    const container = document.querySelector(".projects-container");
    if (!container) {
      console.warn('Projects container not found');
      return;
    }
    
    // Prevent multiple simultaneous loads
    if (projectsLoading) {
      console.log('Projects already loading, skipping...');
      return;
    }
    
    projectsLoading = true;
    
    try {
      console.log('Loading projects from projects.json...');
      const response = await fetch('./projects.json');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const projects = data.projects;
      
      if (!projects || !Array.isArray(projects)) {
        throw new Error('Invalid projects data format');
      }
      
      console.log(`Loaded ${projects.length} projects`);
      
      // Clear container except placeholder
      const placeholder = container.querySelector(".project-detail-placeholder");
      container.innerHTML = '';
      if (placeholder) {
        container.appendChild(placeholder);
      }
      
      // Generate project items
      projects.forEach((project, index) => {
        // Create project item
        const projectItem = document.createElement('div');
        projectItem.className = 'project-item';
        projectItem.setAttribute('data-project-id', project.id);
        projectItem.setAttribute('data-original-index', index.toString());
        
        // Create portrait
        const portrait = document.createElement('div');
        portrait.className = 'project-portrait';
        portrait.style.backgroundImage = `url('${project.portrait}')`;
        
        // Create info
        const info = document.createElement('div');
        info.className = 'project-info';
        
        const title = document.createElement('span');
        title.className = 'project-title';
        title.textContent = project.title;
        
        const tag = document.createElement('span');
        tag.className = 'project-tag';
        tag.textContent = project.tag;
        
        info.appendChild(title);
        info.appendChild(tag);
        
        // Create detail
        const detail = document.createElement('div');
        detail.className = 'project-detail';
        detail.setAttribute('data-detail-id', project.id);
        
        // Create images container
        const imagesContainer = document.createElement('div');
        imagesContainer.className = 'project-detail-images';
        
        project.images.forEach((imageUrl) => {
          const image = document.createElement('div');
          image.className = 'project-detail-image';
          image.style.backgroundImage = `url('${imageUrl}')`;
          imagesContainer.appendChild(image);
        });
        
        // Create text container
        const textContainer = document.createElement('div');
        textContainer.className = 'project-detail-text';
        
        project.description.forEach((paragraph) => {
          const p = document.createElement('p');
          p.className = 'project-description';
          p.textContent = paragraph;
          textContainer.appendChild(p);
        });
        
        // Create links container
        const linksContainer = document.createElement('div');
        linksContainer.className = 'project-detail-links';
        
        project.links.forEach((link) => {
          const a = document.createElement('a');
          a.className = 'project-link';
          a.href = link.url;
          a.textContent = link.text;
          linksContainer.appendChild(a);
        });
        
        // Assemble detail
        detail.appendChild(imagesContainer);
        detail.appendChild(textContainer);
        detail.appendChild(linksContainer);
        
        // Assemble project item
        projectItem.appendChild(portrait);
        projectItem.appendChild(info);
        projectItem.appendChild(detail);
        
        // Insert before placeholder
        if (placeholder) {
          container.insertBefore(projectItem, placeholder);
        } else {
          container.appendChild(projectItem);
        }
      });
      
      // Initialize project interactions after rendering
      initializeProjectInteractions(container);
      projectsLoaded = true;
      projectsLoading = false;
      console.log('Projects loaded and initialized successfully');
    } catch (error) {
      console.error('Error loading projects:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
      projectsLoading = false;
      // Show a fallback message in the container
      if (container) {
        container.innerHTML = '<div style="color: var(--text-secondary); padding: 20px;">Failed to load projects. Please check the console for details.</div>';
      }
    }
  }
  
  // Global variable to track expanded project (shared across all instances)
  let currentExpandedProjectItem = null;
  let clickOutsideHandlerAdded = false;
  let hiddenProjectItems = []; // Store references to hidden items

  // Initialize project expand/collapse functionality
  function initializeProjectInteractions(container) {
    const projectItems = container.querySelectorAll(".project-item");
    
    if (projectItems.length === 0) return;
    const placeholder = container.querySelector(".project-detail-placeholder");
    
    projectItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        // Don't trigger if clicking on detail links
        if (e.target.closest(".project-link")) {
          return;
        }
        
        e.preventDefault();
        e.stopPropagation();
        
        const detail = item.querySelector(".project-detail");
        const isCurrentlyExpanded = item.classList.contains("expanded");
        
        // Close any currently expanded item
        if (currentExpandedProjectItem && currentExpandedProjectItem !== item) {
          // Find detail - it might be in the item or moved to container
          let currentDetail = currentExpandedProjectItem.querySelector(".project-detail");
          if (!currentDetail) {
            // Detail was moved, find it by data attribute
            const detailId = currentExpandedProjectItem.getAttribute("data-project-id");
            const currentContainer = currentExpandedProjectItem.closest(".projects-container");
            currentDetail = currentContainer?.querySelector(`.project-detail[data-detail-id="${detailId}"]`);
          }
          currentExpandedProjectItem.classList.remove("expanded");
          
          if (currentDetail) {
            // Remove active class first to trigger fade out
            currentDetail.classList.remove("active");
            
            // Wait for transition to complete before moving element back and resetting grid
            setTimeout(() => {
              if (!currentDetail.classList.contains("active")) {
                currentExpandedProjectItem.appendChild(currentDetail);
                // Reset grid position after detail is moved back
                currentExpandedProjectItem.style.gridRow = "";
                currentExpandedProjectItem.style.gridColumn = "";
                currentExpandedProjectItem.removeAttribute("data-grid-row");
                currentExpandedProjectItem.removeAttribute("data-grid-column");
              }
            }, 500);
          } else {
            // Reset grid position immediately if no detail
            currentExpandedProjectItem.style.gridRow = "";
            currentExpandedProjectItem.style.gridColumn = "";
            currentExpandedProjectItem.removeAttribute("data-grid-row");
            currentExpandedProjectItem.removeAttribute("data-grid-column");
          }
          
          const currentContainer = currentExpandedProjectItem.closest(".projects-container");
          if (currentContainer) {
            currentContainer.classList.remove("has-expanded");
            currentContainer.classList.remove("has-single-expanded");
            
            // Restore hidden project items in their original order
            const currentPlaceholder = currentContainer.querySelector(".project-detail-placeholder");
            
            // Sort by original index to maintain order
            hiddenProjectItems.sort((a, b) => a.originalIndex - b.originalIndex);
            
            hiddenProjectItems.forEach(({ element, originalIndex, parent }) => {
              if (element && parent && !element.parentNode) {
                // Find insertion point based on original index
                const allItems = Array.from(currentContainer.querySelectorAll(".project-item"));
                let insertBefore = null;
                
                for (const currentItem of allItems) {
                  const currentIndex = parseInt(currentItem.getAttribute('data-original-index') || '9999', 10);
                  if (currentIndex >= originalIndex) {
                    insertBefore = currentItem;
                    break;
                  }
                }
                
                if (!insertBefore) {
                  if (currentPlaceholder && currentPlaceholder.parentNode === parent) {
                    insertBefore = currentPlaceholder;
                  } else {
                    parent.appendChild(element);
                    return;
                  }
                }
                
                if (insertBefore && insertBefore.parentNode === parent) {
                  parent.insertBefore(element, insertBefore);
                }
              }
            });
            hiddenProjectItems = [];
            
            if (currentPlaceholder) currentPlaceholder.style.display = "none";
          }
        }
        
        if (isCurrentlyExpanded) {
          // Collapse: remove expanded state and move detail back
          // Find detail - it might be moved to container
          let detailToCollapse = detail;
          if (!detailToCollapse) {
            const detailId = item.getAttribute("data-project-id");
            detailToCollapse = container.querySelector(`.project-detail[data-detail-id="${detailId}"]`);
          }
          
          item.classList.remove("expanded");
          
          if (detailToCollapse) {
            // Remove active class first to trigger fade out
            detailToCollapse.classList.remove("active");
            
            // Wait for transition to complete before moving element back and resetting grid
            setTimeout(() => {
              if (!detailToCollapse.classList.contains("active")) {
                item.appendChild(detailToCollapse);
                // Reset grid position after detail is moved back
                item.style.gridRow = "";
                item.style.gridColumn = "";
                item.removeAttribute("data-grid-row");
                item.removeAttribute("data-grid-column");
              }
            }, 500);
          } else {
            // Reset grid position immediately if no detail
            item.style.gridRow = "";
            item.style.gridColumn = "";
            item.removeAttribute("data-grid-row");
            item.removeAttribute("data-grid-column");
          }
          
          container.classList.remove("has-expanded");
          container.classList.remove("has-single-expanded");
          
          // Restore hidden project items in their original order
          const placeholder = container.querySelector(".project-detail-placeholder");
          
          // Sort by original index to maintain order
          hiddenProjectItems.sort((a, b) => a.originalIndex - b.originalIndex);
          
          hiddenProjectItems.forEach(({ element, originalIndex, parent }) => {
            if (element && parent && !element.parentNode) {
              // Find insertion point: find the first item with originalIndex >= this item's originalIndex
              const allItems = Array.from(container.querySelectorAll(".project-item"));
              let insertBefore = null;
              
              for (const currentItem of allItems) {
                const currentIndex = parseInt(currentItem.getAttribute('data-original-index') || '9999', 10);
                if (currentIndex >= originalIndex) {
                  insertBefore = currentItem;
                  break;
                }
              }
              
              // If no item found, insert before placeholder or at end
              if (!insertBefore) {
                if (placeholder && placeholder.parentNode === parent) {
                  insertBefore = placeholder;
                } else {
                  // Append to end
                  parent.appendChild(element);
                  return;
                }
              }
              
              // Insert before the found element
              if (insertBefore && insertBefore.parentNode === parent) {
                parent.insertBefore(element, insertBefore);
              }
            }
          });
          hiddenProjectItems = [];
          
          if (placeholder) placeholder.style.display = "none";
          currentExpandedProjectItem = null;
        } else {
          // Expand: determine column and move detail to opposite column
          let itemIndex = -1;
          projectItems.forEach((otherItem, index) => {
            if (otherItem === item) {
              itemIndex = index;
            }
          });
          
          // In a 2-column grid: even indices (0, 2, 4...) are left column, odd (1, 3, 5...) are right column
          const isLeftColumn = itemIndex % 2 === 0;
          
          // Calculate the grid row and column positions (1-indexed for CSS Grid)
          const row = Math.floor(itemIndex / 2) + 1;
          const column = isLeftColumn ? 1 : 2;
          
          // Lock the expanded item's position in the grid using inline styles
          item.style.gridRow = row.toString();
          item.style.gridColumn = column.toString();
          item.setAttribute("data-grid-row", row.toString());
          item.setAttribute("data-grid-column", column.toString());
          item.classList.add("expanded");
          
          if (detail) {
            // Remove detail from item first
            detail.remove();
            
            // Place detail in the opposite column of the expanded item
            // Left column (1) -> detail goes to right (2), Right column (2) -> detail goes to left (1)
            const detailColumn = isLeftColumn ? 2 : 1;
            const detailColumnName = isLeftColumn ? "right" : "left";
            
            detail.setAttribute("data-column", detailColumnName);
            detail.setAttribute("data-row", row.toString());
            // Set explicit grid position for the detail
            detail.style.gridRow = row.toString();
            detail.style.gridColumn = detailColumn.toString();
            
            // Remove active class to ensure clean state
            detail.classList.remove("active");
            
            // Insert the detail element appropriately based on column
            if (isLeftColumn) {
              // Left column item: detail goes to right column, insert after the item
              if (item.nextSibling) {
                container.insertBefore(detail, item.nextSibling);
              } else {
                container.appendChild(detail);
              }
            } else {
              // Right column item: detail goes to left column, insert before the item
              container.insertBefore(detail, item);
            }
            
            // Add container classes first to trigger fade out
            container.classList.add("has-expanded");
            container.classList.add("has-single-expanded");
            
            // Hide other project items by removing them from DOM after fade out
            // Store references with their original index for proper restoration
            hiddenProjectItems = [];
            projectItems.forEach((otherItem, index) => {
              if (otherItem !== item && !otherItem.classList.contains("expanded")) {
                hiddenProjectItems.push({
                  element: otherItem,
                  originalIndex: index,
                  parent: otherItem.parentNode
                });
                // Remove from DOM after fade out transition completes
                setTimeout(() => {
                  if (otherItem.parentNode && !otherItem.classList.contains("expanded")) {
                    otherItem.remove();
                  }
                }, 400);
              }
            });
            // Sort by original index to maintain order
            hiddenProjectItems.sort((a, b) => a.originalIndex - b.originalIndex);
            
            // Force reflow to ensure initial state is applied
            void detail.offsetHeight;
            
            // Add active class after a brief delay to trigger smooth animation
            requestAnimationFrame(() => {
              detail.classList.add("active");
            });
          }
          currentExpandedProjectItem = item;
        }
      });
    });
    
    // Close expanded project when clicking outside (only add once)
    if (!clickOutsideHandlerAdded) {
      document.addEventListener("click", (e) => {
        // Don't close if clicking on projects trigger or projects showcase
        if (e.target.closest(".projects-trigger") || e.target.closest(".projects-showcase")) {
          return;
        }
        
        if (currentExpandedProjectItem) {
          const container = currentExpandedProjectItem.closest(".projects-container");
          if (container && !container.contains(e.target)) {
            // Find detail - it might be in the item or moved to container
            let detail = currentExpandedProjectItem.querySelector(".project-detail");
            if (!detail) {
              const detailId = currentExpandedProjectItem.getAttribute("data-project-id");
              detail = container.querySelector(`.project-detail[data-detail-id="${detailId}"]`);
            }
            currentExpandedProjectItem.classList.remove("expanded");
            
            if (detail) {
              // Remove active class first to trigger fade out
              detail.classList.remove("active");
              
              // Wait for transition to complete before moving element back and resetting grid
              setTimeout(() => {
                if (!detail.classList.contains("active")) {
                  currentExpandedProjectItem.appendChild(detail);
                  // Reset grid position after detail is moved back
                  currentExpandedProjectItem.style.gridRow = "";
                  currentExpandedProjectItem.style.gridColumn = "";
                  currentExpandedProjectItem.removeAttribute("data-grid-row");
                  currentExpandedProjectItem.removeAttribute("data-grid-column");
                }
              }, 500);
            } else {
              // Reset grid position immediately if no detail
              currentExpandedProjectItem.style.gridRow = "";
              currentExpandedProjectItem.style.gridColumn = "";
              currentExpandedProjectItem.removeAttribute("data-grid-row");
              currentExpandedProjectItem.removeAttribute("data-grid-column");
            }
            
            container.classList.remove("has-expanded");
            container.classList.remove("has-single-expanded");
            
            // Restore hidden project items in their original order
            const placeholder = container.querySelector(".project-detail-placeholder");
            
            // Sort by original index to maintain order
            hiddenProjectItems.sort((a, b) => a.originalIndex - b.originalIndex);
            
            hiddenProjectItems.forEach(({ element, originalIndex, parent }) => {
              if (element && parent && !element.parentNode) {
                // Find insertion point based on original index
                const allItems = Array.from(container.querySelectorAll(".project-item"));
                let insertBefore = null;
                
                for (const currentItem of allItems) {
                  const currentIndex = parseInt(currentItem.getAttribute('data-original-index') || '9999', 10);
                  if (currentIndex >= originalIndex) {
                    insertBefore = currentItem;
                    break;
                  }
                }
                
                if (!insertBefore) {
                  if (placeholder && placeholder.parentNode === parent) {
                    insertBefore = placeholder;
                  } else {
                    parent.appendChild(element);
                    return;
                  }
                }
                
                if (insertBefore && insertBefore.parentNode === parent) {
                  parent.insertBefore(element, insertBefore);
                }
              }
            });
            hiddenProjectItems = [];
            
            if (placeholder) placeholder.style.display = "none";
            currentExpandedProjectItem = null;
          }
        }
      }, true); // Use capture phase to catch events early
      clickOutsideHandlerAdded = true;
    }
  }
  
  // Preload projects and blog posts on page load
  // This ensures content is ready when user hovers
  loadProjects();
  loadBlogPosts();
});

