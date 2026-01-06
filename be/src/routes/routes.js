const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user.controller');
const employerCtrl = require('../controllers/employer.controller');
const candidateCtrl = require('../controllers/candidate.controller');
const jobCtrl = require('../controllers/job.controller');
const applicationCtrl = require('../controllers/application.controller');
const { authenticate, authorizeRole } = require('../middleware/auth.middleware');
const authCtrl = require('../controllers/auth.controller');
const jwt = require('jsonwebtoken');

//login & register (namespace under /auth)
router.post('/auth/register', authCtrl.register);
router.post('/auth/login', authCtrl.login);


// profile (any authenticated user)
router.get('/me', authenticate, userCtrl.getProfile);
router.put('/me', authenticate, userCtrl.updateProfile);


// employer - current authenticated user's profile
router.get('/employers/me', authenticate, authorizeRole(['employer','admin']), employerCtrl.getMe);
router.put('/employers/me', authenticate, authorizeRole(['employer','admin']), employerCtrl.updateMe);
router.post('/employers/me/password', authenticate, authorizeRole(['employer','admin']), employerCtrl.changePassword);
router.delete('/employers/me', authenticate, authorizeRole(['employer','admin']), employerCtrl.deleteMe);

// employer routes (admin only)
router.get('/employers', authenticate, authorizeRole(['admin']), employerCtrl.getAllEmployers);
router.get('/employers/:id', authenticate, authorizeRole(['admin']), employerCtrl.getEmployerById);
router.post('/employers', authenticate, authorizeRole(['admin']), employerCtrl.createEmployer);
router.put('/employers/:id', authenticate, authorizeRole(['admin']), employerCtrl.updateEmployer);
router.delete('/employers/:id', authenticate, authorizeRole(['admin']), employerCtrl.deleteEmployer);


// candidate - current authenticated user's profile
router.get('/candidates/me', authenticate, authorizeRole(['candidate','admin']), candidateCtrl.getMe);
router.put('/candidates/me', authenticate, authorizeRole(['candidate','admin']), candidateCtrl.updateMe);
router.post('/candidates/me/password', authenticate, authorizeRole(['candidate','admin']), candidateCtrl.changePassword);
router.delete('/candidates/me', authenticate, authorizeRole(['candidate','admin']), candidateCtrl.deleteMe);

// candidate routes (admin CRUD)
router.get('/candidates', authenticate, authorizeRole(['admin']), candidateCtrl.getAllCandidates);
router.get('/candidates/:id', authenticate, authorizeRole(['admin']), candidateCtrl.getCandidateById);
router.post('/candidates', authenticate, authorizeRole(['admin']), candidateCtrl.createCandidate);
router.put('/candidates/:id', authenticate, authorizeRole(['admin']), candidateCtrl.updateCandidate);
router.delete('/candidates/:id', authenticate, authorizeRole(['admin']), candidateCtrl.deleteCandidate);

//jobs routes (employers and admin)
router.get('/jobs/me', authenticate, authorizeRole(['employer','admin']), jobCtrl.getJobsByEmployer);
router.get('/jobs/open', authenticate, authorizeRole(['candidate','admin']), jobCtrl.getOpenJobs);
router.get('/jobs', authenticate, authorizeRole(['employer','admin']), jobCtrl.getAllJobs);
router.get('/jobs/:id', authenticate, authorizeRole(['employer','admin']), jobCtrl.getJobById);
router.post('/jobs', authenticate, authorizeRole(['employer','admin']), jobCtrl.createJob);
router.put('/jobs/:id', authenticate, authorizeRole(['employer','admin']), jobCtrl.updateJob);
router.delete('/jobs/:id', authenticate, authorizeRole(['employer','admin']), jobCtrl.deleteJob);

//job routes (candidates)
router.get('/jobs/available', authenticate, authorizeRole(['candidate','admin']), candidateCtrl.getAvailableJobs);
router.get('/jobs/applied', authenticate, authorizeRole(['candidate','admin']), candidateCtrl.getAppliedJobs);
router.post('/jobs/:id/apply', authenticate, authorizeRole(['candidate','admin']), candidateCtrl.applyToJob);

// application routes
router.post('/applications', authenticate, authorizeRole(['candidate','admin']), applicationCtrl.createApplication);
router.get('/applications/job/:job_id', authenticate, authorizeRole(['employer','admin']), applicationCtrl.getApplicationsByJobId);
router.get('/applications/candidate/:candidate_id', authenticate, authorizeRole(['candidate','admin']), applicationCtrl.getApplicationsByCandidateId);
router.get('/applications/me', authenticate, authorizeRole(['employer','admin']), applicationCtrl.getApplicationsForMyJobs);
router.put('/applications/:application_id/status', authenticate, authorizeRole(['employer','admin']), applicationCtrl.updateApplicationStatus);
router.delete('/applications/:application_id', authenticate, authorizeRole(['employer','candidate','admin']), applicationCtrl.deleteApplication);

// admin-only: list users
router.get('/', authenticate, authorizeRole(['admin']), userCtrl.getAllUsers);
router.delete('/users/:id', authenticate, authorizeRole(['admin']), userCtrl.deleteUser);


module.exports = router;