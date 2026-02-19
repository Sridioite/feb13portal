// Proof & Submission Management

// Get proof data from localStorage
function getProofData() {
  const data = localStorage.getItem('jobTrackerProofData');
  return data ? JSON.parse(data) : {
    githubLink: '',
    deployedLink: ''
  };
}

// Save proof data to localStorage
function saveProofData(data) {
  localStorage.setItem('jobTrackerProofData', JSON.stringify(data));
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

// Check if project can be shipped
function canShip() {
  return areAllTestsPassed() && areAllLinksValid();
}

// Get project status
function getProjectStatus() {
  const testsPass = areAllTestsPassed();
  const linksValid = areAllLinksValid();
  
  if (testsPass && linksValid) {
    return 'Shipped';
  } else if (testsPass || linksValid) {
    return 'In Progress';
  } else {
    return 'Not Started';
  }
}

// Validate and save
function validateAndSave() {
  const githubLink = document.getElementById('githubLink').value.trim();
  const deployedLink = document.getElementById('deployedLink').value.trim();
  
  // Validate GitHub link
  const githubError = document.getElementById('githubError');
  if (githubLink && !isValidUrl(githubLink)) {
    githubError.textContent = '⚠️ Invalid URL format. Must start with http:// or https://';
    githubError.style.display = 'block';
  } else if (githubLink && !githubLink.includes('github.com')) {
    githubError.textContent = '⚠️ Please enter a valid GitHub repository URL';
    githubError.style.display = 'block';
  } else {
    githubError.style.display = 'none';
  }
  
  // Validate deployed link
  const deployedError = document.getElementById('deployedError');
  if (deployedLink && !isValidUrl(deployedLink)) {
    deployedError.textContent = '⚠️ Invalid URL format. Must start with http:// or https://';
    deployedError.style.display = 'block';
  } else {
    deployedError.style.display = 'none';
  }
  
  const data = {
    githubLink,
    deployedLink
  };
  
  saveProofData(data);
  updateUI();
}

// Update UI based on status
function updateUI() {
  const testsPass = areAllTestsPassed();
  const linksValid = areAllLinksValid();
  const status = getProjectStatus();
  
  // Update project status badge
  const statusBadge = document.getElementById('projectStatusBadge');
  if (statusBadge) {
    statusBadge.textContent = status;
    statusBadge.className = 'project-status__badge';
    
    if (status === 'Shipped') {
      statusBadge.classList.add('project-status__badge--shipped');
    } else if (status === 'In Progress') {
      statusBadge.classList.add('project-status__badge--progress');
    } else {
      statusBadge.classList.add('project-status__badge--not-started');
    }
  }
  
  // Update step 7 status (tests)
  const step7Status = document.getElementById('step7Status');
  if (step7Status) {
    if (testsPass) {
      step7Status.textContent = 'Completed';
      step7Status.className = 'step-item__status step-item__status--completed';
    } else {
      step7Status.textContent = 'Pending';
      step7Status.className = 'step-item__status step-item__status--pending';
    }
  }
  
  // Update step 8 status (proof)
  const step8Status = document.getElementById('step8Status');
  if (step8Status) {
    if (linksValid) {
      step8Status.textContent = 'Completed';
      step8Status.className = 'step-item__status step-item__status--completed';
    } else {
      step8Status.textContent = 'Pending';
      step8Status.className = 'step-item__status step-item__status--pending';
    }
  }
  
  // Show/hide shipped message
  const shippedMessage = document.getElementById('shippedMessage');
  if (shippedMessage) {
    shippedMessage.style.display = status === 'Shipped' ? 'flex' : 'none';
  }
  
  // Show validation status
  updateValidationStatus(testsPass, linksValid);
  
  // Enable/disable copy button
  const copyBtn = document.getElementById('copySubmissionBtn');
  if (copyBtn) {
    copyBtn.disabled = !canShip();
  }
}

// Update validation status message
function updateValidationStatus(testsPass, linksValid) {
  const validationStatus = document.getElementById('validationStatus');
  if (!validationStatus) return;
  
  const messages = [];
  
  if (!testsPass) {
    messages.push('❌ Complete all 10 test checklist items');
  } else {
    messages.push('✅ All tests passed');
  }
  
  if (!linksValid) {
    messages.push('❌ Provide both valid URLs (GitHub + Deployed)');
  } else {
    messages.push('✅ All links provided');
  }
  
  if (messages.length > 0) {
    validationStatus.innerHTML = messages.map(msg => `<div>${msg}</div>`).join('');
    validationStatus.style.display = 'block';
    
    if (canShip()) {
      validationStatus.className = 'validation-status validation-status--success';
    } else {
      validationStatus.className = 'validation-status validation-status--warning';
    }
  }
}

// Copy final submission
function copyFinalSubmission() {
  if (!canShip()) {
    alert('Please complete all tests and provide all links before copying submission.');
    return;
  }
  
  const data = getProofData();
  
  const submission = `Job Notification Tracker — Final Submission

GitHub Repository:
${data.githubLink}

Live Deployment:
${data.deployedLink}

Core Features:
- Intelligent match scoring
- Daily digest simulation
- Status tracking
- Test checklist enforced

---

All tests passed and ready for review.`;
  
  navigator.clipboard.writeText(submission).then(() => {
    alert('Final submission copied to clipboard!');
  }).catch(err => {
    console.error('Failed to copy:', err);
    alert('Failed to copy to clipboard. Please try again.');
  });
}

// Clear proof data
function clearProofData() {
  if (confirm('Are you sure you want to clear all proof data?')) {
    localStorage.removeItem('jobTrackerProofData');
    
    document.getElementById('githubLink').value = '';
    document.getElementById('deployedLink').value = '';
    
    updateUI();
    alert('Proof data cleared successfully!');
  }
}

// Load proof data on page load
document.addEventListener('DOMContentLoaded', () => {
  const data = getProofData();
  
  // Populate inputs
  document.getElementById('githubLink').value = data.githubLink || '';
  document.getElementById('deployedLink').value = data.deployedLink || '';
  
  // Update UI
  updateUI();
});
