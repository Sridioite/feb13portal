// Ship Page Logic

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
  
  if (!areAllTestsPassed()) {
    // Show locked state
    container.innerHTML = `
      <div class="ship-locked">
        <div class="ship-locked__icon">🔒</div>
        <h1 class="ship-locked__title">Ship Page Locked</h1>
        <p class="ship-locked__description">
          You must complete all tests in the test checklist before accessing this page.
        </p>
        <div class="ship-locked__stats">
          <div class="ship-locked__stat">
            <span class="ship-locked__stat-label">Tests Passed:</span>
            <span class="ship-locked__stat-value">${getPassedCount()} / 10</span>
          </div>
        </div>
        <a href="07-test.html" class="btn btn--primary">Go to Test Checklist</a>
      </div>
    `;
  } else {
    // Show unlocked state
    container.innerHTML = `
      <div class="ship-unlocked">
        <div class="ship-unlocked__icon">🚀</div>
        <h1 class="ship-unlocked__title">Ready to Ship!</h1>
        <p class="ship-unlocked__description">
          All tests have passed. Your Job Notification Tracker is ready for deployment.
        </p>
        
        <div class="ship-checklist">
          <h3>Pre-Deployment Checklist:</h3>
          <ul>
            <li>✅ All features tested and working</li>
            <li>✅ No console errors</li>
            <li>✅ Data persists correctly</li>
            <li>✅ Filters and sorting work</li>
            <li>✅ Match scoring accurate</li>
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

// Celebrate ship
function celebrateShip() {
  alert('🎉 Congratulations! Your Job Notification Tracker is shipped!\n\nAll features are working correctly and ready for production.');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  renderShipPage();
});
