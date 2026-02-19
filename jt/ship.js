// Ship Page Logic

// Get proof data from localStorage
function getProofData() {
  const data = localStorage.getItem('jobTrackerProofData');
  return data ? JSON.parse(data) : {
    githubLink: '',
    deployedLink: ''
  };
}

// Validate URL format
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

// Check if all links are provided and valid
function areAllLinksValid() {
  const data = getProofData();
  const githubValid = data.githubLink && isValidUrl(data.githubLink) && data.githubLink.includes('github.com');
  const deployedValid = data.deployedLink && isValidUrl(data.deployedLink);
  return githubValid && deployedValid;
}

// Check if all tests are passed
function areAllTestsPassed() {
  const status = localStorage.getItem('jobTrackerTestStatus');
  if (!status) return false;
  
  const testStatus = JSON.parse(status);
  const testKeys = [
    'preferences-persist',
    'match-score',
    'show-matches',
    'save-persist',
    'apply-new-tab',
    'status-persist',
    'status-filter',
    'digest-top10',
    'digest-persist',
    'no-errors'
  ];
  
  return testKeys.every(key => testStatus[key] === true);
}

// Render ship page
function renderShipPage() {
  const container = document.getElementById('shipContainer');
  if (!container) return;
  
  const testsPass = areAllTestsPassed();
  const linksValid = areAllLinksValid();
  const canShip = testsPass && linksValid;
  
  if (!canShip) {
    // Show locked state
    const passedCount = getPassedCount();
    const linksCount = getLinksCount();
    
    container.innerHTML = `
      <div class="ship-locked">
        <div class="ship-locked__icon">🔒</div>
        <h1 class="ship-locked__title">Ship Page Locked</h1>
        <p class="ship-locked__description">
          You must complete all requirements before accessing this page.
        </p>
        <div class="ship-locked__stats">
          <div class="ship-locked__stat">
            <span class="ship-locked__stat-label">Tests Passed:</span>
            <span class="ship-locked__stat-value">${passedCount} / 10</span>
          </div>
          <div class="ship-locked__stat">
            <span class="ship-locked__stat-label">Links Provided:</span>
            <span class="ship-locked__stat-value">${linksCount} / 2</span>
          </div>
        </div>
        <div style="display: flex; gap: 12px; justify-content: center;">
          <a href="07-test.html" class="btn btn--secondary">Go to Test Checklist</a>
          <a href="../proof.html" class="btn btn--secondary">Go to Proof Page</a>
        </div>
      </div>
    `;
  } else {
    // Show unlocked state
    container.innerHTML = `
      <div class="ship-unlocked">
        <div class="ship-unlocked__icon">🚀</div>
        <h1 class="ship-unlocked__title">Ready to Ship!</h1>
        <p class="ship-unlocked__description">
          All tests have passed and all links are provided. Your Job Notification Tracker is ready for deployment.
        </p>
        
        <div class="ship-checklist">
          <h3>Pre-Deployment Checklist:</h3>
          <ul>
            <li>✅ All features tested and working</li>
            <li>✅ No console errors</li>
            <li>✅ Data persists correctly</li>
            <li>✅ Filters and sorting work</li>
            <li>✅ Match scoring accurate</li>
            <li>✅ GitHub repository provided</li>
            <li>✅ Deployment URL provided</li>
          </ul>
        </div>
        
        <div class="ship-actions">
          <a href="../dashboard.html" class="btn btn--secondary">Back to Dashboard</a>
          <button class="btn btn--primary" onclick="celebrateShip()">🎉 Ship It!</button>
        </div>
      </div>
    `;
  }
}

// Get passed test count
function getPassedCount() {
  const status = localStorage.getItem('jobTrackerTestStatus');
  if (!status) return 0;
  
  const testStatus = JSON.parse(status);
  return Object.values(testStatus).filter(v => v === true).length;
}

// Get links count
function getLinksCount() {
  const data = getProofData();
  let count = 0;
  
  if (data.githubLink && isValidUrl(data.githubLink) && data.githubLink.includes('github.com')) {
    count++;
  }
  if (data.deployedLink && isValidUrl(data.deployedLink)) {
    count++;
  }
  
  return count;
}

// Celebrate ship
function celebrateShip() {
  alert('🎉 Congratulations! Your Job Notification Tracker is shipped!\n\nAll features are working correctly and ready for production.');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  renderShipPage();
});
