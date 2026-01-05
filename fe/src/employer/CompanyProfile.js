import React, { useEffect, useState } from 'react';
import { getEmployerMe, updateEmployerMe } from '../services/api';
export default function CompanyProfile() {
  const [employer, setEmployer] = useState(null);
  const [status, setStatus] = useState(null);
  const [editing, setEditing] = useState({ personal: {}, company: {} });
  const [loading, setLoading] = useState(false);

  const fetchEmployer = async () => {
    setLoading(true);
    try {
      const epl = await getEmployerMe();
      setEmployer(epl);
      setStatus(null);
      return epl;
    } catch (e) {
      console.error('Failed to load employer:', e);
      setStatus('Failed to load employer');
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployer();
  }, []);

  const startEdit = (section, field) =>
    setEditing((s) => ({ ...s, [section]: { ...s[section], [field]: true } }));
  const cancelEdit = (section, field) =>
    setEditing((s) => ({ ...s, [section]: { ...s[section], [field]: false } }));

  const personalField = (label, field, value, onChangeFn) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <div style={{ flex: 1 }}>
        <strong>{label}:</strong>
        {!editing.personal[field] ? (
          <span style={{ marginLeft: 8 }}>{value ?? '-'}</span>
        ) : (
          <input name={field} value={value || ''} onChange={onChangeFn} style={{ marginLeft: 8 }} />
        )}
      </div>
      {!editing.personal[field] ? (
        <button onClick={() => startEdit('personal', field)}>Edit</button>
      ) : (
        <>
          <button onClick={async () => await savePersonalField(field)}>Save</button>
          <button onClick={() => cancelEdit('personal', field)}>Cancel</button>
        </>
      )}
    </div>
  );

  const companyField = (label, field, value, onChangeFn) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <div style={{ flex: 1 }}>
        <strong>{label}:</strong>
        {!editing.company[field] ? (
          <span style={{ marginLeft: 8 }}>{value ?? '-'}</span>
        ) : (
          <input name={field} value={value || ''} onChange={onChangeFn} style={{ marginLeft: 8 }} />
        )}
      </div>
      {!editing.company[field] ? (
        <button onClick={() => startEdit('company', field)}>Edit</button>
      ) : (
        <>
          <button onClick={async () => await saveCompanyField(field)}>Save</button>
          <button onClick={() => cancelEdit('company', field)}>Cancel</button>
        </>
      )}
    </div>
  );

  const onEmployerChange = (e) => setEmployer((emp) => ({ ...emp, [e.target.name]: e.target.value }));

  const savePersonalField = async (field) => {
    setStatus('saving...');
    try {
      const payload = {
        employer_name: employer.employer_name,
        employer_email: employer.employer_email,
        contact_number: employer.contact_number,
        company_name: employer.company_name,
        company_address: employer.company_address,
        company_website: employer.company_website,
      };

      await updateEmployerMe(payload);
      const fresh = await fetchEmployer();
      setEmployer(fresh || employer);
      setStatus('Saved');
    } catch (err) {
      setStatus('Error: ' + (err?.message || err));
    } finally {
      cancelEdit('personal', field);
    }
  };

  const saveCompanyField = async (field) => {
    setStatus('saving...');
    try {
      const payload = {
        employer_name: employer.employer_name,
        employer_email: employer.employer_email,
        contact_number: employer.contact_number,
        company_name: employer.company_name,
        company_address: employer.company_address,
        company_website: employer.company_website,
      };

      await updateEmployerMe(payload);
      const fresh = await fetchEmployer();
      setEmployer(fresh || employer);
      setStatus('Saved');
    } catch (err) {
      setStatus('Error: ' + (err?.message || err));
    } finally {
      cancelEdit('company', field);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h2 style={{ margin: 0 }}>Profile</h2>
        <button onClick={fetchEmployer} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <section style={{ marginTop: 12 }}>
        <h3>Personal</h3>
        {personalField('Full name', 'employer_name', employer?.employer_name, onEmployerChange)}
        {personalField('Email', 'employer_email', employer?.employer_email, onEmployerChange)}
        {personalField('Contact number', 'contact_number', employer?.contact_number, onEmployerChange)}
      </section>

      <section style={{ marginTop: 20 }}>
        <h3>Company</h3>
        {companyField('Company name', 'company_name', employer?.company_name, onEmployerChange)}
        {companyField('Address', 'company_address', employer?.company_address, onEmployerChange)}
        {companyField('Website', 'company_website', employer?.company_website, onEmployerChange)}
      </section>

      {status && <pre style={{ marginTop: 12 }}>{status}</pre>}
    </div>
  );
}
