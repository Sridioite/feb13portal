// Daily Digest Engine

// Get today's date in YYYY-MM-DD format (local time)
function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get digest key for today
function getTodayDigestKey() {
  return `jobTrackerDigest_${getTodayDate()}`;
}

// Get stored digest for today
function getTodayDigest() {
  const key = getTodayDigestKey();
  const digest = localStorage.getItem(key);
  return digest ? JSON.parse(digest) : null;
}

// Save digest for today
function saveDigest(digestData) {
  const key = getTodayDigestKey();
  localStorage.setItem(key, JSON.stringify(digestData));
}

// Generate digest
function generateDigest() {
  const preferences = getPreferences();
  
  if (!preferences) {
    alert('Please set your preferences first to generate a personalized digest.');
    window.location.href = 'settings.html';
    return;
  }
  
  // Calculate match scores for all jobs
  const jobsWithScores = jobsData.map(job => ({
    ...job,
    matchScore: calculateMatchScore(job, preferences)
  }));
  
  // Filter jobs that meet minimum match score threshold
  const qualifyingJobs = jobsWithScores.filter(job => 
    job.matchScore >= preferences.minMatchScore
  );
  
  // Sort by match score (desc) then by postedDaysAgo (asc)
  const sortedJobs = qualifyingJobs.sort((a, b) => {
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }
    return a.postedDaysAgo - b.postedDaysAgo;
  });
  
  // Take top 10
  const top10 = sortedJobs.slice(0, 10);
  
  const digestData = {
    date: getTodayDate(),
    generatedAt: new Date().toISOString(),
    jobs: top10,
    threshold: preferences.minMatchScore
  };
  
  // Save to localStorage
  saveDigest(digestData);
  
  // Render digest
  renderDigest(digestData);
}

// Render digest
function renderDigest(digestData) {
  const container = document.getElementById('digestContainer');
  if (!container) return;
  
  const dateFormatted = new Date(digestData.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  if (digestData.jobs.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3 class="empty-state__title">No matching roles today.</h3>
        <p class="empty-state__description">Check again tomorrow or adjust your preferences.</p>
      </div>
    `;
    return;
  }
  
  const jobsHTML = digestData.jobs.map((job, index) => `
    <div class="digest-job">
      <div class="digest-job__header">
        <div class="digest-job__number">${index + 1}</div>
        <div class="digest-job__content">
          <h3 class="digest-job__title">${job.title}</h3>
          <div class="digest-job__company">${job.company}</div>
        </div>
        <div class="match-score ${getMatchScoreBadgeClass(job.matchScore)}">${job.matchScore}% Match</div>
      </div>
      <div class="digest-job__details">
        <span>📍 ${job.location}</span>
        <span>💼 ${job.mode}</span>
        <span>⏱️ ${job.experience}</span>
        <span>💰 ${job.salaryRange}</span>
      </div>
      <div class="digest-job__actions">
        <button class="btn btn--secondary btn--small" onclick="viewJob(${job.id})">View Details</button>
        <button class="btn btn--primary btn--small" onclick="applyJob('${job.applyUrl}')">Apply Now</button>
      </div>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="digest-email">
      <div class="digest-email__header">
        <h1>Top 10 Jobs For You — 9AM Digest</h1>
        <p class="digest-email__date">${dateFormatted}</p>
      </div>
      
      <div class="digest-email__body">
        ${jobsHTML}
      </div>
      
      <div class="digest-email__footer">
        <p>This digest was generated based on your preferences.</p>
        <p class="digest-email__note">Demo Mode: Daily 9AM trigger simulated manually.</p>
      </div>
      
      <div class="digest-email__actions">
        <button class="btn btn--secondary" onclick="copyDigestToClipboard()">📋 Copy Digest to Clipboard</button>
        <button class="btn btn--primary" onclick="createEmailDraft()">✉️ Create Email Draft</button>
      </div>
    </div>
  `;
  
  // Show action buttons
  document.getElementById('digestActions').style.display = 'flex';
}

// Copy digest to clipboard
function copyDigestToClipboard() {
  const digest = getTodayDigest();
  if (!digest) return;
  
  const dateFormatted = new Date(digest.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  let text = `TOP 10 JOBS FOR YOU — 9AM DIGEST\n${dateFormatted}\n\n`;
  
  digest.jobs.forEach((job, index) => {
    text += `${index + 1}. ${job.title} at ${job.company}\n`;
    text += `   Location: ${job.location} | Mode: ${job.mode} | Experience: ${job.experience}\n`;
    text += `   Salary: ${job.salaryRange} | Match: ${job.matchScore}%\n`;
    text += `   Apply: ${job.applyUrl}\n\n`;
  });
  
  text += `This digest was generated based on your preferences.\n`;
  text += `Demo Mode: Daily 9AM trigger simulated manually.`;
  
  navigator.clipboard.writeText(text).then(() => {
    alert('Digest copied to clipboard!');
  }).catch(err => {
    console.error('Failed to copy:', err);
    alert('Failed to copy to clipboard. Please try again.');
  });
}

// Create email draft
function createEmailDraft() {
  const digest = getTodayDigest();
  if (!digest) return;
  
  const dateFormatted = new Date(digest.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const subject = 'My 9AM Job Digest';
  
  let body = `TOP 10 JOBS FOR YOU — 9AM DIGEST\n${dateFormatted}\n\n`;
  
  digest.jobs.forEach((job, index) => {
    body += `${index + 1}. ${job.title} at ${job.company}\n`;
    body += `   Location: ${job.location} | Mode: ${job.mode} | Experience: ${job.experience}\n`;
    body += `   Salary: ${job.salaryRange} | Match: ${job.matchScore}%\n`;
    body += `   Apply: ${job.applyUrl}\n\n`;
  });
  
  body += `This digest was generated based on your preferences.\n`;
  body += `Demo Mode: Daily 9AM trigger simulated manually.`;
  
  // Use Gmail compose URL
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  
  window.open(gmailUrl, '_blank');
}

// Initialize digest page
document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('digestContainer')) return;
  
  const preferences = getPreferences();
  const existingDigest = getTodayDigest();
  
  // Check if preferences are set
  if (!preferences) {
    document.getElementById('noPreferencesBanner').style.display = 'block';
    document.getElementById('generateButton').disabled = true;
    return;
  }
  
  // Load existing digest if available
  if (existingDigest) {
    renderDigest(existingDigest);
  }
});


// Render status history
function renderStatusHistory() {
  const container = document.getElementById('statusHistorySection');
  if (!container) return;
  
  const history = getStatusHistory();
  
  if (history.length === 0) {
    container.innerHTML = '';
    return;
  }
  
  const recentUpdates = history.slice(0, 5); // Show last 5 updates
  
  const historyHTML = recentUpdates.map(update => {
    const date = new Date(update.date);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const statusClass = getStatusBadgeClass(update.status);
    
    return `
      <div class="status-history-item">
        <div class="status-history-item__content">
          <div class="status-history-item__title">${update.title}</div>
          <div class="status-history-item__company">${update.company}</div>
        </div>
        <div class="status-history-item__meta">
          <div class="status-badge ${statusClass}">${update.status}</div>
          <div class="status-history-item__date">${dateStr} ${timeStr}</div>
        </div>
      </div>
    `;
  }).join('');
  
  container.innerHTML = `
    <div class="status-history">
      <h3 class="status-history__title">Recent Status Updates</h3>
      <div class="status-history__list">
        ${historyHTML}
      </div>
    </div>
  `;
}

// Update DOMContentLoaded to render status history
document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('digestContainer')) return;
  
  const preferences = getPreferences();
  const existingDigest = getTodayDigest();
  
  // Render status history
  renderStatusHistory();
  
  // Check if preferences are set
  if (!preferences) {
    document.getElementById('noPreferencesBanner').style.display = 'block';
    document.getElementById('generateButton').disabled = true;
    return;
  }
  
  // Load existing digest if available
  if (existingDigest) {
    renderDigest(existingDigest);
  }
});
