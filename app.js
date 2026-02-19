// Job Notification Tracker - Main App Logic

// Get preferences from localStorage
function getPreferences() {
  const prefs = localStorage.getItem('jobTrackerPreferences');
  return prefs ? JSON.parse(prefs) : null;
}

// Calculate match score for a job based on user preferences
function calculateMatchScore(job, preferences) {
  if (!preferences) return 0;
  
  let score = 0;
  
  // +25 if any roleKeyword appears in job.title (case-insensitive)
  if (preferences.roleKeywords && preferences.roleKeywords.length > 0) {
    const titleLower = job.title.toLowerCase();
    const titleMatch = preferences.roleKeywords.some(keyword => 
      titleLower.includes(keyword.toLowerCase())
    );
    if (titleMatch) score += 25;
  }
  
  // +15 if any roleKeyword appears in job.description
  if (preferences.roleKeywords && preferences.roleKeywords.length > 0) {
    const descLower = job.description.toLowerCase();
    const descMatch = preferences.roleKeywords.some(keyword => 
      descLower.includes(keyword.toLowerCase())
    );
    if (descMatch) score += 15;
  }
  
  // +15 if job.location matches preferredLocations
  if (preferences.preferredLocations && preferences.preferredLocations.length > 0) {
    if (preferences.preferredLocations.includes(job.location)) {
      score += 15;
    }
  }
  
  // +10 if job.mode matches preferredMode
  if (preferences.preferredMode && preferences.preferredMode.length > 0) {
    if (preferences.preferredMode.includes(job.mode)) {
      score += 10;
    }
  }
  
  // +10 if job.experience matches experienceLevel
  if (preferences.experienceLevel && job.experience === preferences.experienceLevel) {
    score += 10;
  }
  
  // +15 if overlap between job.skills and user.skills (any match)
  if (preferences.skills && preferences.skills.length > 0 && job.skills && job.skills.length > 0) {
    const userSkillsLower = preferences.skills.map(s => s.toLowerCase());
    const jobSkillsLower = job.skills.map(s => s.toLowerCase());
    const hasOverlap = userSkillsLower.some(skill => 
      jobSkillsLower.some(jobSkill => jobSkill.includes(skill) || skill.includes(jobSkill))
    );
    if (hasOverlap) score += 15;
  }
  
  // +5 if postedDaysAgo <= 2
  if (job.postedDaysAgo <= 2) {
    score += 5;
  }
  
  // +5 if source is LinkedIn
  if (job.source === 'LinkedIn') {
    score += 5;
  }
  
  // Cap score at 100
  return Math.min(score, 100);
}

// Get match score badge class
function getMatchScoreBadgeClass(score) {
  if (score >= 80) return 'match-score--excellent';
  if (score >= 60) return 'match-score--good';
  if (score >= 40) return 'match-score--neutral';
  return 'match-score--low';
}

// Utility: Format posted days ago
function formatPostedDays(days) {
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

// Utility: Get saved jobs from localStorage
function getSavedJobs() {
  const saved = localStorage.getItem('savedJobs');
  return saved ? JSON.parse(saved) : [];
}

// Utility: Save job to localStorage
function saveJob(jobId) {
  const savedJobs = getSavedJobs();
  if (!savedJobs.includes(jobId)) {
    savedJobs.push(jobId);
    localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
  }
}

// Utility: Remove job from localStorage
function unsaveJob(jobId) {
  let savedJobs = getSavedJobs();
  savedJobs = savedJobs.filter(id => id !== jobId);
  localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
}

// Utility: Check if job is saved
function isJobSaved(jobId) {
  return getSavedJobs().includes(jobId);
}

// Create job card HTML
function createJobCard(job, showUnsave = false) {
  const isSaved = isJobSaved(job.id);
  const saveButtonText = showUnsave ? 'Unsave' : (isSaved ? 'Saved' : 'Save');
  const saveButtonClass = isSaved && !showUnsave ? 'btn--secondary' : 'btn--secondary';
  
  // Calculate match score
  const preferences = getPreferences();
  const matchScore = preferences ? calculateMatchScore(job, preferences) : 0;
  const matchBadgeClass = getMatchScoreBadgeClass(matchScore);
  
  const matchScoreBadge = preferences ? `
    <div class="match-score ${matchBadgeClass}">${matchScore}% Match</div>
  ` : '';
  
  const saveAction = showUnsave ? `unsaveJobAndRefresh(${job.id})` : `toggleSaveJob(${job.id})`;
  
  return `
    <div class="job-card" data-job-id="${job.id}">
      <div class="job-card__header">
        <div>
          <h3 class="job-card__title">${job.title}</h3>
          <div class="job-card__company">${job.company}</div>
        </div>
        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
          <div class="job-card__source job-card__source--${job.source.toLowerCase()}">${job.source}</div>
          ${matchScoreBadge}
        </div>
      </div>
      
      <div class="job-card__details">
        <span class="job-card__detail">📍 ${job.location}</span>
        <span class="job-card__detail">💼 ${job.mode}</span>
        <span class="job-card__detail">⏱️ ${job.experience}</span>
      </div>
      
      <div class="job-card__salary">${job.salaryRange}</div>
      
      <div class="job-card__footer">
        <span class="job-card__posted">${formatPostedDays(job.postedDaysAgo)}</span>
        <div class="job-card__actions">
          <button class="btn btn--secondary btn--small" onclick="viewJob(${job.id})">View</button>
          <button class="btn ${saveButtonClass} btn--small" onclick="${saveAction}">${saveButtonText}</button>
          <button class="btn btn--primary btn--small" onclick="applyJob('${job.applyUrl}')">Apply</button>
        </div>
      </div>
    </div>
  `;
}

// View job details in modal
function viewJob(jobId) {
  const job = jobsData.find(j => j.id === jobId);
  if (!job) return;
  
  const modal = document.getElementById('jobModal');
  const modalContent = document.getElementById('modalContent');
  
  modalContent.innerHTML = `
    <div class="modal__header">
      <h2>${job.title}</h2>
      <button class="modal__close" onclick="closeModal()">&times;</button>
    </div>
    <div class="modal__body">
      <div class="modal__company">${job.company}</div>
      <div class="modal__meta">
        <span>📍 ${job.location}</span>
        <span>💼 ${job.mode}</span>
        <span>⏱️ ${job.experience}</span>
      </div>
      <div class="modal__salary">${job.salaryRange}</div>
      <div class="modal__section">
        <h4>Description</h4>
        <p>${job.description}</p>
      </div>
      <div class="modal__section">
        <h4>Required Skills</h4>
        <div class="modal__skills">
          ${job.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
        </div>
      </div>
      <div class="modal__actions">
        <button class="btn btn--secondary" onclick="closeModal()">Close</button>
        <button class="btn btn--primary" onclick="applyJob('${job.applyUrl}')">Apply Now</button>
      </div>
    </div>
  `;
  
  modal.style.display = 'flex';
}

// Close modal
function closeModal() {
  const modal = document.getElementById('jobModal');
  modal.style.display = 'none';
}

// Apply to job
function applyJob(url) {
  window.open(url, '_blank');
}

// Toggle save job
function toggleSaveJob(jobId) {
  if (isJobSaved(jobId)) {
    unsaveJob(jobId);
  } else {
    saveJob(jobId);
  }
  // Refresh the current page
  if (window.location.pathname.includes('dashboard')) {
    renderDashboard();
  }
}

// Unsave job and refresh saved page
function unsaveJobAndRefresh(jobId) {
  unsaveJob(jobId);
  renderSavedJobs();
}

// Filter and sort jobs
function filterJobs(jobs, filters) {
  const preferences = getPreferences();
  
  // Calculate match scores for all jobs
  let filtered = jobs.map(job => ({
    ...job,
    matchScore: preferences ? calculateMatchScore(job, preferences) : 0
  }));
  
  // Apply match threshold filter if "Show only matches" is enabled
  if (filters.showOnlyMatches && preferences) {
    filtered = filtered.filter(job => job.matchScore >= preferences.minMatchScore);
  }
  
  // Keyword search
  if (filters.keyword) {
    const keyword = filters.keyword.toLowerCase();
    filtered = filtered.filter(job => 
      job.title.toLowerCase().includes(keyword) || 
      job.company.toLowerCase().includes(keyword)
    );
  }
  
  // Location filter
  if (filters.location && filters.location !== 'all') {
    filtered = filtered.filter(job => job.location === filters.location);
  }
  
  // Mode filter
  if (filters.mode && filters.mode !== 'all') {
    filtered = filtered.filter(job => job.mode === filters.mode);
  }
  
  // Experience filter
  if (filters.experience && filters.experience !== 'all') {
    filtered = filtered.filter(job => job.experience === filters.experience);
  }
  
  // Source filter
  if (filters.source && filters.source !== 'all') {
    filtered = filtered.filter(job => job.source === filters.source);
  }
  
  // Sort
  if (filters.sort === 'latest') {
    filtered.sort((a, b) => a.postedDaysAgo - b.postedDaysAgo);
  } else if (filters.sort === 'oldest') {
    filtered.sort((a, b) => b.postedDaysAgo - a.postedDaysAgo);
  } else if (filters.sort === 'match') {
    filtered.sort((a, b) => b.matchScore - a.matchScore);
  } else if (filters.sort === 'salary') {
    // Simple salary sort - extract first number from salary range
    filtered.sort((a, b) => {
      const extractNum = (str) => {
        const match = str.match(/(\d+)/);
        return match ? parseInt(match[1]) : 0;
      };
      return extractNum(b.salaryRange) - extractNum(a.salaryRange);
    });
  }
  
  return filtered;
}

// Get current filters from UI
function getCurrentFilters() {
  return {
    keyword: document.getElementById('keywordSearch')?.value || '',
    location: document.getElementById('locationFilter')?.value || 'all',
    mode: document.getElementById('modeFilter')?.value || 'all',
    experience: document.getElementById('experienceFilter')?.value || 'all',
    source: document.getElementById('sourceFilter')?.value || 'all',
    sort: document.getElementById('sortFilter')?.value || 'latest',
    showOnlyMatches: document.getElementById('showOnlyMatches')?.checked || false
  };
}

// Render dashboard
function renderDashboard() {
  const container = document.getElementById('jobsContainer');
  if (!container) return;
  
  const preferences = getPreferences();
  const filters = getCurrentFilters();
  const filteredJobs = filterJobs(jobsData, filters);
  
  // Show banner if preferences not set
  const banner = document.getElementById('preferencesBanner');
  if (banner) {
    banner.style.display = preferences ? 'none' : 'block';
  }
  
  if (filteredJobs.length === 0) {
    const emptyMessage = preferences && filters.showOnlyMatches 
      ? 'No roles match your criteria. Adjust filters or lower threshold.'
      : 'No jobs found. Try adjusting your filters to see more results.';
    
    container.innerHTML = `
      <div class="empty-state">
        <h3 class="empty-state__title">No jobs found</h3>
        <p class="empty-state__description">${emptyMessage}</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = filteredJobs.map(job => createJobCard(job)).join('');
}

// Render saved jobs
function renderSavedJobs() {
  const container = document.getElementById('savedJobsContainer');
  if (!container) return;
  
  const savedJobIds = getSavedJobs();
  const savedJobsData = jobsData.filter(job => savedJobIds.includes(job.id));
  
  if (savedJobsData.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h1 class="empty-state__title">No saved jobs yet.</h1>
        <p class="empty-state__description">Jobs you save will appear here for easy access.</p>
        <div class="empty-state__action">
          <a href="dashboard.html" class="btn btn--primary">Browse Jobs</a>
        </div>
      </div>
    `;
    return;
  }
  
  container.innerHTML = savedJobsData.map(job => createJobCard(job, true)).join('');
}

// Initialize dashboard
if (document.getElementById('jobsContainer')) {
  renderDashboard();
  
  // Add filter event listeners
  document.getElementById('keywordSearch')?.addEventListener('input', renderDashboard);
  document.getElementById('locationFilter')?.addEventListener('change', renderDashboard);
  document.getElementById('modeFilter')?.addEventListener('change', renderDashboard);
  document.getElementById('experienceFilter')?.addEventListener('change', renderDashboard);
  document.getElementById('sourceFilter')?.addEventListener('change', renderDashboard);
  document.getElementById('sortFilter')?.addEventListener('change', renderDashboard);
  document.getElementById('showOnlyMatches')?.addEventListener('change', renderDashboard);
}

// Initialize saved jobs page
if (document.getElementById('savedJobsContainer')) {
  renderSavedJobs();
}

// Close modal on outside click
window.onclick = function(event) {
  const modal = document.getElementById('jobModal');
  if (event.target === modal) {
    closeModal();
  }
}
