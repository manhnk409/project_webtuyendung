import React, { useState } from 'react';
import './employer.css';
import EmployerHome from './EmployerHome';
import Jobs from './Jobs';
import Applicants from './Applicants';
import CompanyProfile from './CompanyProfile';
import Settings from './Settings';

export default function DashboardLayout({ onBack, forceProfileEdit }) {
  const [panel, setPanel] = useState(forceProfileEdit ? 'profile' : 'overview');

  React.useEffect(() => {
    if (forceProfileEdit) {
      setPanel('profile');
    }
  }, [forceProfileEdit]);

  return (
    <div className="employer-dashboard">
      <aside className="employer-sidebar">
        <h3>Employer</h3>
        <ul>
          <li className={panel === 'overview' ? 'active' : ''} onClick={() => setPanel('overview')}>Dashboard</li>
          <li className={panel === 'jobs' ? 'active' : ''} onClick={() => setPanel('jobs')}>Job Posts</li>
          <li className={panel === 'applicants' ? 'active' : ''} onClick={() => setPanel('applicants')}>Applicants</li>
          <li className={panel === 'profile' ? 'active' : ''} onClick={() => setPanel('profile')}>Company Profile</li>
          <li className={panel === 'settings' ? 'active' : ''} onClick={() => setPanel('settings')}>Settings</li>
        </ul>
        <button className="back-btn" onClick={() => onBack && onBack()}>Back</button>
      </aside>

      <main className="employer-main">
        {panel === 'overview' && <EmployerHome />}
        {panel === 'jobs' && <Jobs />}
        {panel === 'applicants' && <Applicants />}
        {panel === 'profile' && <CompanyProfile />}
        {panel === 'settings' && <Settings />}
      </main>
    </div>
  );
}
