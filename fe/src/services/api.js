const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8080';

async function request(path, options = {}) {
  const tokenRaw = localStorage.getItem('auth');
  let token = null;
  let userId = null;
  try {
    const parsed = tokenRaw ? JSON.parse(tokenRaw) : null;
    token = parsed ? parsed.token : null;
    const user = parsed ? parsed.user : null;
    if (user) userId = user.id || user.user_id || user.ID || user.userId || null;
  } catch (e) {}

  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    // defensive: trim whitespace/newlines which can corrupt the header
    const safe = typeof token === 'string' ? token.trim() : token;
    headers['Authorization'] = 'Bearer ' + safe;
  }
  // include user id in a separate header when available (helps backend debugging/auth flows)
  if (userId) headers['X-User-Id'] = String(userId);

  const res = await fetch(API_BASE + path, {
    headers,
    ...options,
  });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    return text;
  }
}

export async function register({ username, password, email, role }) {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password, email, role }),
  });
}

export async function login({ username, password }) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function getUserMe() {
  return request('/api/me');
}

// Job APIs
export async function getMyJobs() {
  return request(`/api/jobs/me`);
}

export async function createJob(jobData) {
  return request('/api/jobs', {
    method: 'POST',
    body: JSON.stringify(jobData),
  });
}

export async function updateJob(jobId, jobData) {
  return request(`/api/jobs/${jobId}`, {
    method: 'PUT',
    body: JSON.stringify(jobData),
  });
}

export async function deleteJob(jobId) {
  return request(`/api/jobs/${jobId}`, {
    method: 'DELETE',
  });
}

export async function getOpenJobs() {
  return request('/api/jobs/open');
}

export async function getApplicationsByJob(jobId) {
  return request(`/api/applications/job/${jobId}`);
}

export async function updateApplicationStatus(applicationId, status) {
  return request(`/api/applications/${applicationId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

export async function getAllMyApplications() {
  return request('/api/applications/me');
}

export async function updateUserMe(payload) {
  return request('/api/me', { method: 'PUT', body: JSON.stringify(payload) });
}

export async function getCandidateMe() {
  return request('/api/candidates/me');
}

export async function updateCandidateMe(payload) {
  return request('/api/candidates/me', { method: 'PUT', body: JSON.stringify(payload) });
}

export async function getEmployerMe(user_id) {
  const res = await request('/api/employers/me');
  // normalize backend `email` -> frontend `employer_email`
  if (res && res.email && !res.employer_email) res.employer_email = res.email;
  return res;
}

export async function updateEmployerMe(payload) {
  // accept frontend `employer_email` but backend expects `email`
  const send = { ...payload };
  if (send.employer_email && !send.email) send.email = send.employer_email;
  return request('/api/employers/me', { method: 'PUT', body: JSON.stringify(send) });
}

export async function changeEmployerPassword(payload) {
  return request('/api/employers/me/password', { method: 'POST', body: JSON.stringify(payload) });
}

export async function changeCandidatePassword(payload) {
  return request('/api/candidates/me/password', { method: 'POST', body: JSON.stringify(payload) });
}
//application APIs
export async function applyToJob(applicationData) {
  return request('/api/applications', {
    method: 'POST',
    body: JSON.stringify(applicationData),
  });
}

export async function getCandidateApplications(candidateId) {
  return request(`/api/applications/candidate/${candidateId}`);
}

export async function deleteApplication(applicationId) {
  return request(`/api/applications/${applicationId}`, { method: 'DELETE' });
}
// Admin APIs
export async function getAllEmployers() {
  return request('/api/employers');
}

export async function getAllCandidates() {
  return request('/api/candidates');
}

export async function getAllUsers() {
  return request('/api/');
}

export async function deleteUser(userId) {
  return request(`/api/users/${userId}`, {
    method: 'DELETE',
  });
}

// Check if user profile is complete based on role
export async function checkProfileCompleteness(role) {
  try {
    if (role === 'employer') {
      const profile = await request('/api/employers/me');
      if (!profile || profile.error) return { complete: false, profile: null, message: 'Employer profile not found' };
      
      const required = ['employer_name', 'company_name', 'company_address', 'company_website', 'contact_number'];
      const email = profile.email || profile.employer_email;
      
      const missing = required.filter(field => !profile[field]);
      if (missing.length > 0 || !email) {
        return { 
          complete: false, 
          profile, 
          message: `Please complete your employer profile. Missing fields: ${missing.join(', ')}${!email ? ', email' : ''}` 
        };
      }
      return { complete: true, profile };
    } else if (role === 'candidate') {
      const profile = await request('/api/candidates/me');
      if (!profile || profile.error) return { complete: false, profile: null, message: 'Candidate profile not found' };
      
      // resume_url and skills are optional for candidates
      const required = ['full_name', 'date_of_birth', 'phone_number'];
      const missing = required.filter(field => !profile[field]);
      
      if (missing.length > 0) {
        return { 
          complete: false, 
          profile, 
          message: `Please complete your candidate profile. Missing fields: ${missing.join(', ')}` 
        };
      }
      return { complete: true, profile };
    }
    return { complete: true, profile: null }; // admin or other roles
  } catch (err) {
    console.error('Profile check error:', err);
    return { complete: false, profile: null, message: 'Failed to check profile' };
  }
}

export default { applyToJob, register, login, getUserMe, updateUserMe, getEmployerMe, updateEmployerMe, changeEmployerPassword };
