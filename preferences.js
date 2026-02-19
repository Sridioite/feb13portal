// Preferences Management

// Get preferences from localStorage
function getPreferences() {
  const prefs = localStorage.getItem('jobTrackerPreferences');
  return prefs ? JSON.parse(prefs) : null;
}

// Save preferences to localStorage
function savePreferences() {
  const roleKeywords = document.getElementById('roleKeywords').value;
  const preferredLocations = Array.from(document.querySelectorAll('input[name="preferredLocations"]:checked')).map(cb => cb.value);
  const preferredMode = Array.from(document.querySelectorAll('input[name="preferredMode"]:checked')).map(cb => cb.value);
  const experienceLevel = document.getElementById('experienceLevel').value;
  const skills = document.getElementById('skills').value;
  const minMatchScore = parseInt(document.getElementById('minMatchScore').value);
  
  const preferences = {
    roleKeywords: roleKeywords.split(',').map(k => k.trim()).filter(k => k),
    preferredLocations,
    preferredMode,
    experienceLevel,
    skills: skills.split(',').map(s => s.trim()).filter(s => s),
    minMatchScore
  };
  
  localStorage.setItem('jobTrackerPreferences', JSON.stringify(preferences));
  
  // Show success message
  alert('Preferences saved successfully!');
  
  // Redirect to dashboard
  window.location.href = 'dashboard.html';
}

// Load preferences into form
function loadPreferences() {
  const prefs = getPreferences();
  if (!prefs) return;
  
  // Role keywords
  if (prefs.roleKeywords) {
    document.getElementById('roleKeywords').value = prefs.roleKeywords.join(', ');
  }
  
  // Preferred locations
  if (prefs.preferredLocations) {
    prefs.preferredLocations.forEach(location => {
      const checkbox = document.querySelector(`input[name="preferredLocations"][value="${location}"]`);
      if (checkbox) checkbox.checked = true;
    });
  }
  
  // Preferred mode
  if (prefs.preferredMode) {
    prefs.preferredMode.forEach(mode => {
      const checkbox = document.querySelector(`input[name="preferredMode"][value="${mode}"]`);
      if (checkbox) checkbox.checked = true;
    });
  }
  
  // Experience level
  if (prefs.experienceLevel) {
    document.getElementById('experienceLevel').value = prefs.experienceLevel;
  }
  
  // Skills
  if (prefs.skills) {
    document.getElementById('skills').value = prefs.skills.join(', ');
  }
  
  // Min match score
  if (prefs.minMatchScore !== undefined) {
    document.getElementById('minMatchScore').value = prefs.minMatchScore;
    document.getElementById('minMatchScoreValue').textContent = prefs.minMatchScore;
  }
}


// Clear all preferences
function clearPreferences() {
  if (confirm('Are you sure you want to clear all preferences? This will reset all your settings.')) {
    // Clear from localStorage
    localStorage.removeItem('jobTrackerPreferences');
    
    // Clear form fields
    document.getElementById('roleKeywords').value = '';
    document.getElementById('skills').value = '';
    document.getElementById('experienceLevel').value = '';
    document.getElementById('minMatchScore').value = 40;
    document.getElementById('minMatchScoreValue').textContent = 40;
    
    // Uncheck all location checkboxes
    document.querySelectorAll('input[name="preferredLocations"]').forEach(cb => {
      cb.checked = false;
    });
    
    // Uncheck all mode checkboxes
    document.querySelectorAll('input[name="preferredMode"]').forEach(cb => {
      cb.checked = false;
    });
    
    // Show banner
    const banner = document.getElementById('preferencesInfoBanner');
    if (banner) {
      banner.style.display = 'block';
    }
    
    alert('Preferences cleared successfully!');
  }
}

// Check if preferences exist and show/hide banner
function checkPreferencesStatus() {
  const prefs = getPreferences();
  const banner = document.getElementById('preferencesInfoBanner');
  
  if (banner) {
    // Show banner if no preferences are set
    banner.style.display = !prefs ? 'block' : 'none';
  }
}

// Update DOMContentLoaded to check preferences status
document.addEventListener('DOMContentLoaded', () => {
  const slider = document.getElementById('minMatchScore');
  const valueDisplay = document.getElementById('minMatchScoreValue');
  
  if (slider && valueDisplay) {
    slider.addEventListener('input', (e) => {
      valueDisplay.textContent = e.target.value;
    });
  }
  
  // Load preferences on page load
  loadPreferences();
  
  // Check preferences status for banner
  checkPreferencesStatus();
});
