class NotebookController {
  currentPage = 0; // 0: cover, 1-4: pages
  totalPages = 4;
  isOpened = false;
  isAnimating = false;

  constructor() {
    this.initializeElements();
    this.bindEvents();
    this.updateDisplay();
  }

  initializeElements() {
    this.notebook = document.getElementById('notebook');
    this.cover = document.getElementById('cover');
    this.openBtn = document.getElementById('openBtn');
    this.prevBtn = document.getElementById('prevBtn');
    this.nextBtn = document.getElementById('nextBtn');
    this.pageStack = document.getElementById('pageStack');
    this.leftPage = document.getElementById('leftPage');
    this.currentPageSpan = document.getElementById('currentPage');
    this.totalPagesSpan = document.getElementById('totalPages');

    // Get all page elements
    this.pages = this.pageStack.querySelectorAll('.page-right');

    // Set total pages display
    this.totalPagesSpan.textContent = this.totalPages;
  }

  bindEvents() {
    // Open notebook
    this.openBtn.addEventListener('click', () => this.openNotebook());
    this.cover.addEventListener('click', () => {
      if (!this.isOpened) this.openNotebook();
    });

    // Navigation
    this.prevBtn.addEventListener('click', () => this.previousPage());
    this.nextBtn.addEventListener('click', () => this.nextPage());

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!this.isOpened || this.isAnimating) return;

      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        this.previousPage();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        this.nextPage();
      }
    });

    // Click areas for page navigation (left/right sides)
    this.notebook.addEventListener('click', (e) => {
      if (!this.isOpened || this.isAnimating) return;

      const rect = this.notebook.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const centerX = rect.width / 2;

      // Only respond to clicks on the page areas, not controls
      const isOnControls = e.target.closest('.nav-controls') ||
        e.target.closest('.open-btn') ||
        e.target.closest('.cover');

      if (!isOnControls) {
        if (clickX < centerX && this.currentPage > 1) {
          this.previousPage();
        } else if (clickX > centerX && this.currentPage < this.totalPages) {
          this.nextPage();
        }
      }
    });
  }

  openNotebook() {
    if (this.isAnimating || this.isOpened) return;

    this.isAnimating = true;
    this.isOpened = true;
    this.currentPage = 1;

    // Add opened class to trigger CSS animations
    this.notebook.classList.add('opened');

    // Initialize page states
    this.initializePageStates();

    // Animation complete
    setTimeout(() => {
      this.isAnimating = false;
      this.updateDisplay();
    }, 1000);
  }

  initializePageStates() {
    // Reset all pages to initial state
    for (const page of this.pages) {
      page.style.transform = '';
      page.classList.remove('turned', 'hidden');
    }
  } nextPage() {
    if (this.isAnimating || this.currentPage >= this.totalPages) return;

    this.isAnimating = true;

    // Get the current page element
    const currentPageElement = this.pageStack.querySelector(`[data-page="${this.currentPage}"]`);

    if (currentPageElement) {
      // Add turning animation class
      currentPageElement.classList.add('turning');

      // After animation completes
      setTimeout(() => {
        currentPageElement.classList.remove('turning');
        currentPageElement.classList.add('turned');

        // Move to next page
        this.currentPage++;

        // If we've turned all pages, hide the current one completely
        if (this.currentPage > this.totalPages) {
          currentPageElement.classList.add('hidden');
          this.currentPage = this.totalPages + 1;
        }

        this.isAnimating = false;
        this.updateDisplay();
      }, 1000);
    }
  }

  previousPage() {
    if (this.isAnimating || this.currentPage <= 1) return;

    this.isAnimating = true;

    // Move to previous page first
    this.currentPage--;

    // Get the page element that should come back
    const pageToReturn = this.pageStack.querySelector(`[data-page="${this.currentPage}"]`);

    if (pageToReturn) {
      // Remove hidden state if it was hidden
      pageToReturn.classList.remove('hidden');

      // If it was turned, bring it back
      if (pageToReturn.classList.contains('turned')) {
        // Start from turned position
        pageToReturn.style.transform = 'rotateY(-180deg)';

        // Animate back to normal position
        setTimeout(() => {
          pageToReturn.classList.add('turning');
          pageToReturn.style.transform = '';

          setTimeout(() => {
            pageToReturn.classList.remove('turning', 'turned');
            this.isAnimating = false;
            this.updateDisplay();
          }, 1000);
        }, 50);
      } else {
        this.isAnimating = false;
        this.updateDisplay();
      }
    }
  }

  updateDisplay() {
    // Update page indicator
    if (this.currentPage === 0) {
      this.currentPageSpan.textContent = 'Cover';
    } else if (this.currentPage > this.totalPages) {
      this.currentPageSpan.textContent = 'End';
    } else {
      this.currentPageSpan.textContent = `Page ${this.currentPage}`;
    }

    // Update navigation buttons
    this.prevBtn.disabled = (this.currentPage <= 1);
    this.nextBtn.disabled = (this.currentPage >= this.totalPages);
  }

  // Method to handle window resize
  handleResize() {
    // Reset any ongoing animations on resize
    if (this.isAnimating) {
      for (const page of this.pages) {
        page.classList.remove('turning');
        page.style.transform = '';
      }
      this.isAnimating = false;
      this.updateDisplay();
    }
  }
}

// Initialize the notebook when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const notebook = new NotebookController();

  // Store reference globally for touch events
  globalThis.notebookController = notebook;

  // Handle window resize
  globalThis.addEventListener('resize', () => notebook.handleResize());

  // Preload images for smoother transitions
  const preloadImages = () => {
    const imageSources = [
      'img/1.jpeg',
      'img/2.jpeg',
      'img/3.jpeg',
      'img/4.jpeg'
    ];

    for (const src of imageSources) {
      const img = new Image();
      img.src = src;
    }
  };

  preloadImages();
});

// Add touch interactions for mobile
if ('ontouchstart' in globalThis) {
  document.addEventListener('DOMContentLoaded', () => {
    const notebook = document.getElementById('notebook');
    let startX = null;
    let startY = null;

    notebook.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    });

    notebook.addEventListener('touchend', (e) => {
      if (!startX || !startY) return;

      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const diffX = startX - endX;
      const diffY = startY - endY;

      // Only trigger if horizontal swipe is more significant than vertical
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        const controller = globalThis.notebookController;
        if (controller?.isOpened && !controller.isAnimating) {
          if (diffX > 0) {
            // Swiped left - next page
            controller.nextPage();
          } else {
            // Swiped right - previous page
            controller.previousPage();
          }
        }
      }

      startX = null;
      startY = null;
    });
  });
}
