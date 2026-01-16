import React, { useState } from 'react';

export default function JobSearchFilter({ onSearch }) {
  const [filters, setFilters] = useState({
    keyword: '',
    location: '',
    salaryMin: '',
    salaryMax: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleReset = () => {
    setFilters({
      keyword: '',
      location: '',
      salaryMin: '',
      salaryMax: ''
    });
    onSearch({});
  };

  return (
    <div style={{
      background: '#f8f9fa',
      padding: '16px',
      borderRadius: '6px',
      marginBottom: '16px',
      border: '1px solid #e6e6e6'
    }}>
      <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem' }}>🔍 Search & Filter Jobs</h3>
      
      <form onSubmit={handleSearch}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginBottom: '12px'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, fontSize: '0.9rem' }}>
              Job Title or Keyword
            </label>
            <input
              type="text"
              name="keyword"
              value={filters.keyword}
              onChange={handleChange}
              placeholder="e.g., Frontend Developer"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '0.9rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, fontSize: '0.9rem' }}>
              Location
            </label>
            <input
              type="text"
              name="location"
              value={filters.location}
              onChange={handleChange}
              placeholder="e.g., Ho Chi Minh City"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '0.9rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, fontSize: '0.9rem' }}>
              Min Salary
            </label>
            <input
              type="text"
              name="salaryMin"
              value={filters.salaryMin}
              onChange={handleChange}
              placeholder="e.g., 10M"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '0.9rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, fontSize: '0.9rem' }}>
              Max Salary
            </label>
            <input
              type="text"
              name="salaryMax"
              value={filters.salaryMax}
              onChange={handleChange}
              placeholder="e.g., 20M"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '0.9rem',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="submit"
            style={{
              padding: '8px 16px',
              background: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.9rem'
            }}
          >
            Search
          </button>
          <button
            type="button"
            onClick={handleReset}
            style={{
              padding: '8px 16px',
              background: '#6c757d',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.9rem'
            }}
          >
            Clear Filters
          </button>
        </div>
      </form>
    </div>
  );
}
