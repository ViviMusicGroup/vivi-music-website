// Mobile drawer toggle
(() => {
  const btn = document.getElementById('mobile-menu-btn');
  const closeBtn = document.getElementById('mobile-close-btn');
  const drawer = document.getElementById('mobile-drawer');
  const backdrop = document.getElementById('mobile-backdrop');
  const icon = document.getElementById('hamburger-icon');

  function openDrawer() {
    drawer.classList.add('open');
    backdrop.classList.add('open');
    icon.textContent = 'close';
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    drawer.classList.remove('open');
    backdrop.classList.remove('open');
    icon.textContent = 'menu';
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', () => {
    drawer.classList.contains('open') ? closeDrawer() : openDrawer();
  });
  closeBtn.addEventListener('click', closeDrawer);
  backdrop.addEventListener('click', closeDrawer);

  // Close drawer when a nav link is clicked
  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      setTimeout(closeDrawer, 150);
    });
  });
})();

// Simple script to highlight active sidebar links on scroll and expand their groups
document.addEventListener('DOMContentLoaded', () => {
  // Force reset scroll positions that might be stuck due to browser state restoration
  const sidebars = document.querySelectorAll('.sidebar-scroll');
  sidebars.forEach(sidebar => {
      sidebar.scrollTop = 0;
  });

  const sections = document.querySelectorAll('h2[id], h3[id]');
  const navLinks = document.querySelectorAll('.nav-link-sidebar');
  
  // Build a list of valid targets
  const validTargets = Array.from(navLinks).map(link => link.getAttribute('data-target'));
  
  let currentActive = '';

  const observerOptions = {
    root: null,
    rootMargin: '-100px 0px -60% 0px',
    threshold: 0
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        if (validTargets.includes(id) && currentActive !== id) {
          currentActive = id;
          navLinks.forEach(link => {
            link.classList.remove('nav-active');
            if (link.getAttribute('data-target') === id) {
              link.classList.add('nav-active');
              
              // Expand the group that contains this active link
              const parentGroup = link.closest('.sidebar-group');
              if (parentGroup) {
                  parentGroup.classList.remove('collapsed');
              }
            }
          });
        }
      }
    });
  }, observerOptions);

  sections.forEach(section => {
    sectionObserver.observe(section);
  });
});
