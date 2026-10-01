document.addEventListener('DOMContentLoaded', () => {
  const leaderboardContainer = document.getElementById('leaderboard-container');
  const recentSupportersContainer = document.getElementById('recent-supporters-container');

  // Fetch sponsors from Cloudflare endpoint, fallback to static JSON if local preview
  async function fetchSponsors() {
    try {
      const response = await fetch('/api/sponsors');
      if (response.ok) {
        return await response.json();
      }
      throw new Error('API not available');
    } catch (e) {
      console.warn('Could not reach API endpoint. Falling back to local static JSON...', e);
      try {
        const localRes = await fetch('/donation.json');
        return await localRes.json();
      } catch (err) {
        console.error('Failed to load fallback JSON', err);
        return null;
      }
    }
  }

  function getRankIcon(index) {
    switch (index) {
      case 0:
        return `<span class="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-400 font-bold border border-yellow-500/30 mb-3 text-sm">👑</span>`;
      case 1:
        return `<span class="flex items-center justify-center w-8 h-8 rounded-full bg-slate-300/20 text-slate-300 font-bold border border-slate-300/30 mb-3 text-sm">🥈</span>`;
      case 2:
        return `<span class="flex items-center justify-center w-8 h-8 rounded-full bg-amber-600/20 text-amber-500 font-bold border border-amber-600/30 mb-3 text-sm">🥉</span>`;
      default:
        return `<span class="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 text-white/50 font-semibold border border-white/10 mb-3 text-xs">${index + 1}</span>`;
    }
  }

  function renderSponsors(data) {
    if (!data) {
      if (leaderboardContainer) leaderboardContainer.innerHTML = '<p class="col-span-full text-center text-on-surface-variant/50">Failed to load sponsor data.</p>';
      return;
    }

    // 1. Render Leaderboard
    const leaderboard = data.leaderboard || [];
    if (leaderboardContainer) {
      if (leaderboard.length === 0) {
        leaderboardContainer.innerHTML = '<p class="col-span-full text-center text-on-surface-variant/50">No leaderboard supporters found yet.</p>';
      } else {
        leaderboardContainer.innerHTML = '';
        leaderboard.forEach((supporter, idx) => {
          const card = document.createElement('div');
          card.className = 'p-8 border-b border-r border-white/10 flex flex-col items-center justify-center min-h-[150px] hover:bg-white/[0.02] transition-colors duration-300 text-center relative overflow-hidden group';
          
          card.innerHTML = `
            ${getRankIcon(idx)}
            <h3 class="text-white font-medium group-hover:text-[#afbeff] transition-colors text-base tracking-wide line-clamp-1 font-geist">
              ${supporter.name}
            </h3>
            <a href="${supporter.link || 'https://ko-fi.com/vividhpashokan'}" target="_blank" rel="noopener noreferrer" class="absolute inset-0 z-10" aria-label="Support page of ${supporter.name}"></a>
          `;
          
          leaderboardContainer.appendChild(card);
        });
      }
    }

    // 2. Render Recent Support Messages
    const recent = data.recent || [];
    if (recentSupportersContainer) {
      if (recent.length === 0) {
        recentSupportersContainer.innerHTML = '<p class="col-span-full text-center text-on-surface-variant/50">No recent supporters found.</p>';
      } else {
        recentSupportersContainer.innerHTML = '';
        recent.forEach((supporter) => {
          const card = document.createElement('div');
          card.className = 'p-8 border-b border-r border-white/10 flex flex-col justify-between hover:bg-white/[0.02] transition-colors duration-300 min-h-[200px] group';
          
          const hasMessage = supporter.message && supporter.message.trim() !== '';
          const bodyHtml = hasMessage 
            ? `<p class="text-[#afbeff]/80 font-geist text-sm leading-relaxed italic mt-4 select-all">
                 "${supporter.message}"
               </p>`
            : `<div class="flex items-center gap-2 mt-6 text-xs text-[#afbeff]/60 font-semibold font-geist">
                 <span class="material-symbols-outlined text-[16px] text-[#afbeff]/50">volunteer_activism</span>
                 Supported the project
               </div>`;

          card.innerHTML = `
            <div class="w-full">
              <div class="flex justify-between items-start gap-4 w-full">
                <h4 class="text-white font-medium text-base tracking-wide line-clamp-1 font-geist">${supporter.name}</h4>
                <span class="text-[#afbeff]/40 text-xs font-semibold uppercase tracking-wider font-geist shrink-0 mt-0.5">
                  ${supporter.date || 'Recent'}
                </span>
              </div>
              ${bodyHtml}
            </div>
          `;
          
          recentSupportersContainer.appendChild(card);
        });
      }
    }
  }

  // Load and render
  fetchSponsors().then(renderSponsors);
});
