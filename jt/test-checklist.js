// Test Checklist Management

// Get test status from localStorage
function getTestStatus() {
  const status = localStorage.getItem('jobTrackerTestStatus');
  return status ? JSON.parse(status) : {};
}

// Save test status to localStorage
function saveTestStatus(status) {
  localStorage.setItem('jobTrackerTestStatus', JSON.stringify(status));
}

// Check if all tests are passed
function areAllTestsPassed() {
  const status = getTestStatus();
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
  
  return testKeys.every(key => status[key] === true);
}

// Get passed test count
function getPassedCount() {
  const status = getTestStatus();
  return Object.values(status).filter(v => v === true).length;
}

// Update test status
function updateTestStatus() {
  const checkboxes = document.querySelectorAll('.test-item__checkbox');
  const status = {};
  
  checkboxes.forEach(checkbox => {
    const testKey = checkbox.getAttribute('data-test');
    status[testKey] = checkbox.checked;
  });
  
  saveTestStatus(status);
  updateUI();
}

// Update UI based on test status
function updateUI() {
  const passedCount = getPassedCount();
  const totalTests = 10;
  
  // Update count
  const countElement = document.getElementById('testCount');
  if (countElement) {
    countElement.textContent = `${passedCount} / ${totalTests}`;
  }
  
  // Show/hide warning
  const warningElement = document.getElementById('testWarning');
  if (warningElement) {
    warningElement.style.display = passedCount < totalTests ? 'block' : 'none';
  }
  
  // Enable/disable ship button
  const shipButton = document.getElementById('shipButton');
  if (shipButton) {
    if (areAllTestsPassed()) {
      shipButton.style.pointerEvents = 'auto';
      shipButton.style.opacity = '1';
    } else {
      shipButton.style.pointerEvents = 'none';
      shipButton.style.opacity = '0.5';
    }
  }
}

// Reset test status
function resetTestStatus() {
  if (confirm('Are you sure you want to reset all test checkboxes?')) {
    localStorage.removeItem('jobTrackerTestStatus');
    
    // Uncheck all checkboxes
    const checkboxes = document.querySelectorAll('.test-item__checkbox');
    checkboxes.forEach(checkbox => {
      checkbox.checked = false;
    });
    
    updateUI();
    alert('Test status reset successfully!');
  }
}

// Show tooltip
function showTooltip(message) {
  alert(message);
}

// Load test status on page load
document.addEventListener('DOMContentLoaded', () => {
  const status = getTestStatus();
  
  // Check checkboxes based on saved status
  const checkboxes = document.querySelectorAll('.test-item__checkbox');
  checkboxes.forEach(checkbox => {
    const testKey = checkbox.getAttribute('data-test');
    if (status[testKey]) {
      checkbox.checked = true;
    }
  });
  
  // Update UI
  updateUI();
});
