// ─── Always show hero on load/refresh ──────────────────────────────────────
// 1. Disable browser's built-in scroll-position memory.
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
// 2. Remove any URL hash (e.g. #features, #community) so the browser
//    doesn't auto-scroll to an anchor section on refresh.
if (window.location.hash) {
  history.replaceState(null, '', window.location.pathname + window.location.search);
}
// 3. Force scroll to top at every lifecycle stage mobile browsers may fire.
function _scrollTop() { window.scrollTo(0, 0); }
_scrollTop();
document.addEventListener('DOMContentLoaded', _scrollTop);
window.addEventListener('load', () => {
  _scrollTop();
  requestAnimationFrame(_scrollTop); // catches Chrome-mobile late restore
});
window.addEventListener('pageshow', _scrollTop); // iOS Safari bfcache restore
// ────────────────────────────────────────────────────────────────────────────

// Optimized Parallax & Smooth Scroll Animations
document.addEventListener('DOMContentLoaded', () => {
  // Global Video Optimization: Pause off-screen videos
  window.videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target;
      if (entry.isIntersecting) {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => console.log('Autoplay prevented:', e));
        }
      } else {
        video.pause();
      }
    });
  }, { rootMargin: '100px' });

  // Observe existing videos
  document.querySelectorAll('video').forEach(vid => {
    window.videoObserver.observe(vid);
  });

  // 1. High-Performance Parallax using CSS Variables
  let ticking = false;
  let cachedMockups = null;

  document.addEventListener('mousemove', (e) => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const amount = 20;
        const x = (e.clientX - window.innerWidth / 2) / amount;
        const y = (e.clientY - window.innerHeight / 2) / amount;

        if (!cachedMockups || cachedMockups.length === 0) {
          cachedMockups = document.querySelectorAll('.mockup-item');
        }

        cachedMockups.forEach((item, index) => {
          const speed = (index + 1) * 0.2;
          item.style.setProperty('--px', `${x * speed}px`);
          item.style.setProperty('--py', `${y * speed}px`);
        });
        ticking = false;
      });
      ticking = true;
    }
  });

  // 2. Intersection Observer for Smooth Scroll Reveals
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-visible');
        entry.target.addEventListener('animationend', function handler() {
          entry.target.classList.remove('reveal-up', 'reveal-visible');
          entry.target.style.animationDelay = '';
          // Removing classes restores Tailwind's hover states safely
        }, { once: true });
        revealObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Select elements to animate
  const animSelectors = [
    '#home h1', '#home p', '[data-purpose="hero-actions"]', '[data-purpose="main-visual"]',
    '#features h1', '#features p', '#dynamic-mockups',
    '#features-carousel h2', '#features-carousel p', '#features-carousel .phone-frame',
    '.bento-glass-card', '.community-banner', '#community h2', '#community p', 
    '#community a.glow-button-purple', '.glow-avatar'
  ];
  
  document.querySelectorAll(animSelectors.join(', ')).forEach((el, index) => {
    el.classList.add('reveal-up');
    // Add slight staggered delay based on DOM order for cascading effect
    el.style.animationDelay = `${(index % 3) * 100}ms`;
    revealObserver.observe(el);
  });
});

// Carousel Logic
const slides = [
  {
    tagline: 'IMMERSIVE VOCALS',
    title: 'Real-Time Synced Lyrics',
    description: 'Sing along with perfectly synced, glowing lyrics that follow every word in real-time. Experience your music like never before.',
    videoSrc: 'slide1' // will check .mp4 and .webm
  },
  {
    tagline: 'FAMILIAR YET FRESH',
    title: 'Intuitive Playback Experience',
    description: 'A beautifully crafted, familiar music player interface inspired by industry standards, but elevated with VIVI\'s unique fluid aesthetic.',
    videoSrc: 'slide2'
  },
  {
    tagline: 'STUDIO SOUND',
    title: 'Studio-Grade Equalizer',
    description: 'Take full control of your audio with our powerful built-in equalizer. Fine-tune every frequency to match your personal listening style.',
    videoSrc: 'slide3'
  },
  {
    tagline: 'STUNNING DESIGN',
    title: 'Visually Stunning Design',
    description: 'Navigate through your library with fluid animations, dynamic color palettes, and glassmorphism effects that bring your music to life.',
    videoSrc: 'slide4'
  },
  {
    tagline: 'SEAMLESS UPDATES',
    title: 'In-Built Updater',
    description: 'Stay on the cutting edge with our native updater. Easily switch between rock-solid Official releases and bleeding-edge Nightly builds with a single tap.',
    videoSrc: 'slide5'
  }
];

let currentIndex = 0;
const slideDuration = 10000; // 10 seconds
let progressInterval;
let startTime;

// DOM Elements
const elTagline = document.getElementById('slide-tagline');
const elTitle = document.getElementById('slide-title');
const elDesc = document.getElementById('slide-desc');
const elVideo = document.getElementById('slide-video');
const elFallback = document.getElementById('video-fallback');
const elFallbackText = document.getElementById('fallback-text');
const elContent = document.getElementById('carousel-content');
const elProgress = document.getElementById('autoplay-progress');
const dotsContainer = document.getElementById('pagination-dots');

if (elTagline) {
  // Create pagination dots
  slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.className = `w-2 h-2 rounded-full transition-all duration-300 ${index === 0 ? 'bg-white w-6' : 'bg-white/30 hover:bg-white/60'}`;
    dot.addEventListener('click', () => goToSlide(index));
    dotsContainer.appendChild(dot);
  });

  function updateDots() {
    Array.from(dotsContainer.children).forEach((dot, index) => {
      if (index === currentIndex) {
        dot.className = 'w-6 h-2 rounded-full transition-all duration-300 bg-white';
      } else {
        dot.className = 'w-2 h-2 rounded-full transition-all duration-300 bg-white/30 hover:bg-white/60';
      }
    });
  }

  function tryLoadVideo(baseName, index) {
    const mp4Src = `screenshots/${baseName}.mp4`;
    const webmSrc = `screenshots/${baseName}.webm`;

    elVideo.style.opacity = '0';
    elFallback.style.opacity = '0';
    
    // Remove previous event listeners
    elVideo.onloadeddata = null;
    elVideo.onerror = null;

    elVideo.onloadeddata = () => {
      elVideo.style.opacity = '1';
      const playPromise = elVideo.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => console.log('Playback prevented:', e));
      }
    };

    elVideo.onerror = () => {
      // If mp4 fails, try webm
      elVideo.onerror = () => {
        // Both failed, show fallback
        elVideo.style.opacity = '0';
        elFallback.style.opacity = '1';
        elFallbackText.innerHTML = `Save video as<br/><b class="text-white">screenshots/${baseName}.mp4</b>`;
      };
      elVideo.src = webmSrc;
      elVideo.load();
    };

    elVideo.src = mp4Src;
    elVideo.load();
  }

  function renderSlide(index) {
    const slide = slides[index];

    // Animate out text
    elContent.style.opacity = '0';
    elContent.style.transform = 'translateY(10px)';
    elVideo.style.opacity = '0'; // fade out current video

    setTimeout(() => {
      // Update content
      elTagline.textContent = slide.tagline;
      elTitle.textContent = slide.title;
      elDesc.textContent = slide.description;

      // Try loading video
      tryLoadVideo(slide.videoSrc, index);

      // Animate in text
      elContent.style.opacity = '1';
      elContent.style.transform = 'translateY(0)';
      updateDots();

      // Reset progress bar
      resetProgress();
    }, 300);
  }

  function resetProgress() {
    cancelAnimationFrame(progressInterval);
    startTime = null;
    if (elProgress) elProgress.style.width = '0%';

    // Small delay to ensure CSS transition applies correctly if needed
    setTimeout(() => {
      startTime = performance.now();
      requestAnimationFrame(updateProgress);
    }, 50);
  }

  function updateProgress(currentTime) {
    if (!startTime) return;

    const elapsed = currentTime - startTime;
    const progress = Math.min((elapsed / slideDuration) * 100, 100);

    if (elProgress) elProgress.style.width = `${progress}%`;

    if (progress >= 100) {
      nextSlide();
    } else {
      progressInterval = requestAnimationFrame(updateProgress);
    }
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) % slides.length;
    renderSlide(currentIndex);
  }

  function prevSlide() {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    renderSlide(currentIndex);
  }

  function goToSlide(index) {
    if (index === currentIndex) return;
    currentIndex = index;
    renderSlide(currentIndex);
  }

  // Event Listeners
  const btnNext = document.getElementById('btn-next');
  if (btnNext) {
    btnNext.addEventListener('click', () => {
      nextSlide();
    });
  }

  const btnPrev = document.getElementById('btn-prev');
  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      prevSlide();
    });
  }

  // Initialize first slide without transition
  const firstSlide = slides[0];
  elTagline.textContent = firstSlide.tagline;
  elTitle.textContent = firstSlide.title;
  elDesc.textContent = firstSlide.description;
  tryLoadVideo(firstSlide.videoSrc, 0);
  updateDots();

  // Start progress
  startTime = performance.now();
  requestAnimationFrame(updateProgress);
}

// Dynamic Mockups Loading
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('dynamic-mockups');
  if (!container) return;

  const maxImages = 5;

  // 1. Instantly render high-performance skeleton cards to prevent layout shifts
  let initialMockups = '';
  for (let i = 0; i < maxImages; i++) {
    initialMockups += `
      <div id="mockup-card-${i}" class="mockup-item snap-center flex-shrink-0 ${
        i === 2 ? 'w-[260px] md:w-[340px] z-20' : 'w-[220px] md:w-[280px]'
      } ${
        i === 0 ? '' : i === 1 ? 'md:-mb-8' : i === 2 ? '' : i === 3 ? 'md:-mb-12' : ''
      } first:ml-4 md:first:ml-0 last:mr-4 md:last:mr-0">
        <div class="relative ${
          i === 2 ? 'shadow-[0_0_80px_rgba(59,130,246,0.3)] rounded-t-3xl md:rounded-t-[3rem]' : 'shadow-2xl rounded-t-3xl md:rounded-t-[2.5rem]'
        } bg-black aspect-[9/19] overflow-hidden">
          <div class="w-full h-full flex flex-col items-center justify-center bg-surface-container text-on-surface-variant p-6 text-center border border-white/5">
            <div class="w-10 h-10 rounded-full border-2 border-t-vivi-blue border-white/10 animate-spin mb-3"></div>
            <p class="text-xs font-semibold tracking-wider opacity-60">LOADING</p>
          </div>
        </div>
      </div>
    `;
  }
  container.innerHTML = initialMockups;

  // Helper to resolve card media progressively
  function loadAndRenderCard(index) {
    const cardContainer = document.getElementById(`mockup-card-${index}`);
    if (!cardContainer) return;
    const innerWrapper = cardContainer.querySelector('.relative');

    let imageResolved = false;
    let videoResolved = false;

    // A. Parallel Image Probes (Instantaneous resolution)
    const imgExtensions = ['.jpg', '.png', '.jpeg'];
    imgExtensions.forEach(ext => {
      const src = `screenshots/${index + 1}${ext}`;
      const img = new Image();
      img.onload = () => {
        if (!videoResolved && !imageResolved) {
          imageResolved = true;
          innerWrapper.innerHTML = `<img src="${src}" class="w-full h-full object-cover" alt="App Screenshot ${index + 1}" loading="lazy" decoding="async" />`;
          
          // Center the 3rd mockup horizontally inside the carousel on mobile
          // Use scrollLeft (not scrollIntoView) so we don't scroll the page vertically
          if (window.innerWidth < 768 && index === 2) {
            setTimeout(() => {
              const c = document.getElementById('dynamic-mockups');
              if (c) c.scrollLeft = cardContainer.offsetLeft - (c.clientWidth / 2) + (cardContainer.clientWidth / 2);
            }, 50);
          }
        }
      };
      img.src = src;
    });

    // B. Parallel Video Probes (Will seamlessly upgrade standard images to playing videos if present)
    const vidExtensions = ['.mp4', '.webm'];
    vidExtensions.forEach(ext => {
      const src = `screenshots/${index + 1}${ext}`;
      const vid = document.createElement('video');
      vid.onloadedmetadata = () => {
        videoResolved = true;
        innerWrapper.innerHTML = `<video src="${src}" class="w-full h-full object-cover" autoplay loop muted playsinline disablePictureInPicture></video>`;
        
        if (window.videoObserver) {
          const videoElement = innerWrapper.querySelector('video');
          if (videoElement) window.videoObserver.observe(videoElement);
        }

        // Center the 3rd mockup horizontally inside the carousel on mobile
        // Use scrollLeft (not scrollIntoView) so we don't scroll the page vertically
        if (window.innerWidth < 768 && index === 2) {
          setTimeout(() => {
            const c = document.getElementById('dynamic-mockups');
            if (c) c.scrollLeft = cardContainer.offsetLeft - (c.clientWidth / 2) + (cardContainer.clientWidth / 2);
          }, 50);
        }
      };
      vid.src = src;
    });

    // C. Fallback Safe Check (Failsafe placeholder in case no assets exist at all)
    setTimeout(() => {
      if (!imageResolved && !videoResolved) {
        innerWrapper.innerHTML = `
          <div class="w-full h-full flex flex-col items-center justify-center bg-surface-container text-on-surface-variant p-6 text-center border-2 border-dashed border-white/10">
            <span class="material-symbols-outlined text-4xl mb-2">add_photo_alternate</span>
            <p class="text-xs font-medium">Save media as<br/><b class="text-white mt-1 block">screenshots/${index + 1}.mp4</b><br/>or <b class="text-white">.jpg</b></p>
          </div>
        `;
      }
    }, 2000);
  }

  // Launch progressive loader for each card in parallel
  for (let i = 0; i < maxImages; i++) {
    loadAndRenderCard(i);
  }
});

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const mobileLinks = document.querySelectorAll('#mobile-menu a, #mobile-menu button');
const mobileMenuChevron = document.getElementById('mobile-menu-chevron');
let isMenuOpen = false;

function toggleMenu() {
  isMenuOpen = !isMenuOpen;
  if (isMenuOpen) {
    mobileMenu.classList.remove('-translate-y-4', 'opacity-0', 'pointer-events-none');
    mobileMenu.classList.add('translate-y-0', 'opacity-100');
    if (mobileMenuChevron) {
      mobileMenuChevron.textContent = 'expand_less';
    }
  } else {
    mobileMenu.classList.add('-translate-y-4', 'opacity-0', 'pointer-events-none');
    mobileMenu.classList.remove('translate-y-0', 'opacity-100');
    if (mobileMenuChevron) {
      mobileMenuChevron.textContent = 'expand_more';
    }
  }
}

if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener('click', toggleMenu);
}

mobileLinks.forEach(link => {
  link.addEventListener('click', () => {
    if (isMenuOpen) toggleMenu();
  });
});

// Fetch and display real-time GitHub repository stats (Stars and Downloads)
document.addEventListener('DOMContentLoaded', () => {
  const repoUrl = 'https://api.github.com/repos/vivizzz007/vivi-music';
  const releasesUrl = 'https://api.github.com/repos/vivizzz007/vivi-music/releases';

  function formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M+';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k+';
    }
    return num + '+';
  }

  // Fetch Stars Count
  fetch(repoUrl)
    .then(res => res.json())
    .then(data => {
      if (data.stargazers_count !== undefined) {
        const elStars = document.getElementById('github-stars');
        if (elStars) {
          elStars.textContent = formatNumber(data.stargazers_count);
        }
      }
    })
    .catch(err => console.error('Error fetching stars:', err));

  // Fetch Total Downloads Count and dynamic download links from v tag
  fetch(releasesUrl)
    .then(res => res.json())
    .then(releases => {
      if (Array.isArray(releases) && releases.length > 0) {
        // 1. Dynamic download links updating from the latest release tag (v tag)
        const latestRelease = releases[0];
        const tagName = latestRelease.tag_name;
        if (tagName) {
          const gmsLink = document.querySelector('#download-modal a[href*="vivi.apk"]');
          const izzyLink = document.querySelector('#download-modal a[href*="vividroid-universal-foss-release.apk"]');
          if (gmsLink) {
            gmsLink.href = `https://github.com/vivizzz007/vivi-music/releases/download/${tagName}/vivi.apk`;
          }
          if (izzyLink) {
            izzyLink.href = `https://github.com/vivizzz007/vivi-music/releases/download/${tagName}/vividroid-universal-foss-release.apk`;
          }
          console.log(`Updated download links dynamically to version ${tagName}`);
        }

        // 2. Stars / Downloads total count computation
        let totalDownloads = 0;
        releases.forEach(release => {
          if (Array.isArray(release.assets)) {
            release.assets.forEach(asset => {
              totalDownloads += (asset.download_count || 0);
            });
          }
        });
        if (totalDownloads > 0) {
          const elDownloads = document.getElementById('github-downloads');
          if (elDownloads) {
            elDownloads.textContent = formatNumber(totalDownloads);
          }
        }
      }
    })
    .catch(err => console.error('Error fetching downloads:', err));
});

// Mouse-tracking radial hover glow for Bento Grid Cards
document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.bento-glass-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
});

// Dynamic scroll-adaptive navbar handler
document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.querySelector('nav[data-purpose="TopNavBar"]');
  if (!navbar) return;

  const isSubPage = window.location.pathname.includes('privacy') || window.location.pathname.includes('terms');
  let blackSectionThreshold = 0;

  function calculateThreshold() {
    blackSectionThreshold = isSubPage ? (window.innerHeight * 0.4 - 80) : (window.innerHeight - 80);
  }

  function handleScroll() {
    const scrollY = window.scrollY;
    
    if (scrollY > blackSectionThreshold) {
      navbar.classList.remove('scrolled');
      navbar.classList.add('scrolled-black');
    } else if (scrollY > 20) {
      navbar.classList.remove('scrolled-black');
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled', 'scrolled-black');
    }
  }

  // Calculate once on load and update on resize
  calculateThreshold();
  window.addEventListener('resize', calculateThreshold, { passive: true });
  
  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', handleScroll);
  handleScroll();
});

// Modal popup handler with entry/exit animations and custom backdrop close listener
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('download-modal');
  if (!modal) return;

  const triggers = document.querySelectorAll('.trigger-download-modal');
  const closeModalBtn = document.getElementById('close-download-modal');
  const backdrop = modal.querySelector('.dialog-backdrop');

  function openModal() {
    modal.showModal();
    // Force browser reflow/repaint to ensure transition applies
    modal.offsetHeight;
    modal.classList.add('is-open');
    // Lock background scroll while modal is open
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('is-open');
    // Restore background scroll
    document.body.style.overflow = '';
    // Wait for the CSS transition (0.25s) to complete before native close
    setTimeout(() => {
      modal.close();
    }, 250);
  }

  triggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal();
    });
  }

  // Close modal when clicking on the custom backdrop element
  if (backdrop) {
    backdrop.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal();
    });
  }
});

// ─── GitHub Latest Release Downloader ───────────────────────────────────────
// Fetches releases from the GitHub API on page load to sum up total downloads
// and retrieve the latest APK download URLs (triggered on GMS/FOSS click).
(function initReleaseFetcher() {
  const REPO = 'vivizzz007/vivi-music';
  const API_URL = `https://api.github.com/repos/${REPO}/releases?per_page=100`;
  const FALLBACK = `https://github.com/${REPO}/releases/latest`;

  let urls = { 
    gms: null, 
    foss: null, 
    beta: "https://nightly.link/vivizzz007/vivi-music/workflows/nightly.yml/main/vivi-music-gms-nightly.zip" 
  };

  // Inject Odometer CSS styles dynamically
  const style = document.createElement('style');
  style.textContent = `
    .odometer-digit-container {
      display: inline-block;
      overflow: hidden;
      height: 1.2em;
      width: 1ch;
      position: relative;
      vertical-align: bottom;
    }
    .odometer-digit-strip {
      display: flex;
      flex-direction: column;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .odometer-digit-strip span {
      height: 1.2em;
      line-height: 1.2em;
      display: block;
      text-align: center;
    }
  `;
  document.head.appendChild(style);

  // Helper to reconcile and update odometer layout smoothly
  function updateOdometer(element, value, suffix = ' total downloads') {
    if (!element) return;
    element.currentValue = value;
    const formatted = `${value.toLocaleString()}${suffix}`;
    const currentNodes = Array.from(element.childNodes);
    const targetLength = formatted.length;

    for (let i = 0; i < targetLength; i++) {
      const char = formatted[i];
      const isDigit = char >= '0' && char <= '9';
      let node = currentNodes[i];

      if (isDigit) {
        const digit = parseInt(char, 10);
        if (!node || !node.classList || !node.classList.contains('odometer-digit-container')) {
          const container = document.createElement('span');
          container.className = 'odometer-digit-container';
          const strip = document.createElement('span');
          strip.className = 'odometer-digit-strip';
          for (let d = 0; d <= 9; d++) {
            const digitSpan = document.createElement('span');
            digitSpan.textContent = d;
            strip.appendChild(digitSpan);
          }
          container.appendChild(strip);
          if (node) {
            element.replaceChild(container, node);
          } else {
            element.appendChild(container);
          }
          node = container;
        }
        const strip = node.querySelector('.odometer-digit-strip');
        if (strip) {
          strip.offsetHeight; // force reflow
          strip.style.transform = `translateY(calc(-${digit} * 1.2em))`;
        }
      } else {
        if (!node || (node.classList && node.classList.contains('odometer-digit-container')) || node.nodeType !== Node.ELEMENT_NODE) {
          const textSpan = document.createElement('span');
          textSpan.textContent = char;
          textSpan.style.display = 'inline-block';
          textSpan.style.whiteSpace = 'pre';
          if (node) {
            element.replaceChild(textSpan, node);
          } else {
            element.appendChild(textSpan);
          }
          node = textSpan;
        } else {
          if (node.textContent !== char) {
            node.textContent = char;
          }
        }
      }
    }

    while (element.childNodes.length > targetLength) {
      element.removeChild(element.lastChild);
    }
  }



  // Helper to update modal links labels
  function updateModalUI(tag) {
    const labelGms = document.getElementById('dl-label-gms');
    const labelFoss = document.getElementById('dl-label-foss');
    if (labelGms && tag) labelGms.textContent = tag;
    if (labelFoss && tag) labelFoss.textContent = tag;
  }

  // Load cached data from localStorage if available to prevent layout shift
  const cachedTotal = localStorage.getItem('vivi_total_downloads');
  const cachedStars = localStorage.getItem('vivi_github_stars');
  const cachedGmsUrl = localStorage.getItem('vivi_gms_url');
  const cachedFossUrl = localStorage.getItem('vivi_foss_url');
  const cachedTag = localStorage.getItem('vivi_latest_tag');

  if (cachedGmsUrl) urls.gms = cachedGmsUrl;
  if (cachedFossUrl) urls.foss = cachedFossUrl;

  function setInitialUI() {
    const totalDownloadsHero = document.getElementById('total-downloads-hero');
    if (totalDownloadsHero) {
      totalDownloadsHero.style.display = 'inline-flex';
      totalDownloadsHero.style.alignItems = 'center';
      totalDownloadsHero.style.transformOrigin = 'left center';

      if (cachedTotal) {
        updateOdometer(totalDownloadsHero, Number(cachedTotal));
      } else {
        totalDownloadsHero.textContent = '300,000+ total downloads';
      }
    }

    const githubStarsHero = document.getElementById('github-stars-hero');
    if (githubStarsHero) {
      githubStarsHero.style.display = 'inline-flex';
      githubStarsHero.style.alignItems = 'center';
      githubStarsHero.style.transformOrigin = 'left center';

      if (cachedStars) {
        updateOdometer(githubStarsHero, Number(cachedStars), ' GitHub stars');
      } else {
        githubStarsHero.textContent = '1,500+ GitHub stars';
      }
    }

    if (cachedTag) {
      updateModalUI(cachedTag);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setInitialUI);
  } else {
    setInitialUI();
  }

  const REPO_API_URL = `https://api.github.com/repos/${REPO}`;

  // Fetch repository stargazers count from GitHub API
  fetch(REPO_API_URL)
    .then(r => r.json())
    .then(data => {
      if (data && data.stargazers_count !== undefined) {
        const stars = data.stargazers_count;
        localStorage.setItem('vivi_github_stars', stars);
        const githubStarsHero = document.getElementById('github-stars-hero');
        if (githubStarsHero) {
          const startStars = githubStarsHero.currentValue || Number(cachedStars) || 1500;
          if (startStars !== stars) {
            updateOdometer(githubStarsHero, stars, ' GitHub stars');
          }
        }
      }
    })
    .catch(() => {});

  // Fetch release assets from GitHub API
  fetch(API_URL)
    .then(r => r.json())
    .then(releases => {
      if (!Array.isArray(releases) || releases.length === 0) return;

      // 1. Process latest release (first item) for download URLs and tag
      const latestRelease = releases[0];
      const tag = latestRelease.tag_name || '';
      (latestRelease.assets || []).forEach(asset => {
        if (asset.name === 'vivi.apk') {
          urls.gms = asset.browser_download_url;
        } else if (asset.name.toLowerCase().includes('vividroid-universal')) {
          urls.foss = asset.browser_download_url;
        }
      });

      // Save latest release info to cache
      if (urls.gms) localStorage.setItem('vivi_gms_url', urls.gms);
      if (urls.foss) localStorage.setItem('vivi_foss_url', urls.foss);
      if (tag) {
        localStorage.setItem('vivi_latest_tag', tag);
        updateModalUI(tag);
      }

      // 2. Sum up total downloads across all releases
      let total = 0;
      releases.forEach(release => {
        (release.assets || []).forEach(asset => {
          const name = asset.name.toLowerCase();
          if (name === 'vivi.apk' || name.includes('vividroid-universal')) {
            total += (asset.download_count || 0);
          }
        });
      });

      if (total > 0) {
        localStorage.setItem('vivi_total_downloads', total);
        const totalDownloadsHero = document.getElementById('total-downloads-hero');
        if (totalDownloadsHero) {
          // Only update if the fetched value is different from the currently displayed value
          const startNum = totalDownloadsHero.currentValue || Number(cachedTotal) || 300000;
          if (startNum !== total) {
            updateOdometer(totalDownloadsHero, total);
          }
        }
      }
    })
    .catch(() => {
      // Silently ignore — fallbacks or cache will be used
    });

  // Wire up download buttons
  document.addEventListener('DOMContentLoaded', () => {
    const btnGms  = document.getElementById('dl-btn-gms');
    const btnFoss = document.getElementById('dl-btn-foss');
    const btnBeta = document.getElementById('dl-btn-beta');
    const btnBetaSec = document.getElementById('dl-btn-beta-section');

    function triggerDownload(e, urlKey) {
      e.preventDefault();
      const url = urls[urlKey] || FALLBACK;

      // Increment local count by 1 (through website interaction)
      const totalDownloadsHero = document.getElementById('total-downloads-hero');
      if (totalDownloadsHero) {
        let currentTotal = totalDownloadsHero.currentValue || Number(localStorage.getItem('vivi_total_downloads')) || 312081;
        let newTotal = currentTotal + 1;
        localStorage.setItem('vivi_total_downloads', newTotal);
        updateOdometer(totalDownloadsHero, newTotal);
      }

      // Automatically close download modal by triggering click on the close button
      const closeBtn = document.getElementById('close-download-modal');
      if (closeBtn) {
        closeBtn.click();
      }

      // window.location.href triggers a file download for .apk/zip without opening a new tab
      window.location.href = url;
    }

    if (btnGms)  btnGms.addEventListener('click',  e => triggerDownload(e, 'gms'));
    if (btnFoss) btnFoss.addEventListener('click', e => triggerDownload(e, 'foss'));
    if (btnBeta) btnBeta.addEventListener('click', e => triggerDownload(e, 'beta'));
    if (btnBetaSec) btnBetaSec.addEventListener('click', e => triggerDownload(e, 'beta'));
  });
})();
// ────────────────────────────────────────────────────────────────────────────

// FAQ Accordion smooth expand/collapse transition
document.addEventListener('DOMContentLoaded', () => {
  const faqItems = document.querySelectorAll('#faq details');
  faqItems.forEach((el) => {
    const summary = el.querySelector('summary');
    const content = el.querySelector('div');
    const arrow = summary.querySelector('.material-symbols-outlined');

    if (!summary || !content) return;

    summary.addEventListener('click', (e) => {
      e.preventDefault();
      
      if (el.hasAttribute('open')) {
        // Closing animation
        el.style.overflow = 'hidden';
        const startHeight = el.offsetHeight;
        const endHeight = summary.offsetHeight;
        
        el.style.height = `${startHeight}px`;
        
        void el.offsetHeight; // force reflow
        
        el.style.transition = 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        el.style.height = `${endHeight}px`;
        if (arrow) {
          arrow.classList.remove('rotate-180');
        }
        
        setTimeout(() => {
          el.removeAttribute('open');
          el.style.height = '';
          el.style.transition = '';
          el.style.overflow = '';
        }, 300);
      } else {
        // Opening animation
        el.setAttribute('open', 'true');
        el.style.overflow = 'hidden';
        const startHeight = summary.offsetHeight;
        const endHeight = el.offsetHeight;
        
        el.style.height = `${startHeight}px`;
        
        void el.offsetHeight; // force reflow
        
        el.style.transition = 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        el.style.height = `${endHeight}px`;
        if (arrow) {
          arrow.classList.add('rotate-180');
        }
        
        setTimeout(() => {
          el.style.height = '';
          el.style.transition = '';
          el.style.overflow = '';
        }, 300);
      }
    });
  });
});




