import React, { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import axios from 'axios';

// Types for nested objects
type Education = {
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
  description: string;
};

type Certification = {
  name: string;
  issuer: string;
  issue_date: string;
  expiration_date: string;
  credential_url: string;
};

type JobSeekerProfileFormData = {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  location: string;
  role: string;
  industry: string;
  about: string;
  skills: string[]; // IDs of skills
  educations: Education[];
  certifications: Certification[];
};

type Skill = {
  id: string;
  name: string;
};

type Props = {
  allSkills: Skill[]
  onSkillsChange: (skills: string[]) => void  // IDs or names
}

const SkillInput: React.FC<Props> = ({ allSkills, onSkillsChange }) => {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<string[]>([])

  const filtered = allSkills.filter(
    (skill) =>
      skill.name.toLowerCase().includes(query.toLowerCase()) &&
      !selected.includes(skill.name)
  )

  const handleAdd = (skillName: string) => {
    if (!skillName.trim() || selected.includes(skillName)) return
    const newSelected = [...selected, skillName]
    setSelected(newSelected)
    onSkillsChange(newSelected)
    setQuery('')
  }

  const handleRemove = (skillName: string) => {
    const updated = selected.filter((s) => s !== skillName)
    setSelected(updated)
    onSkillsChange(updated)
  }

  return (
    <div className="mb-4 p-3 border rounded bg-light">
      <h3>Skills</h3>
      <div className="d-flex flex-wrap gap-2 mb-2">
        {selected.map((skill) => (
          <span key={skill} className="badge bg-primary">
            {skill}{' '}
            <button
              type="button"
              className="btn-close btn-close-white btn-sm ms-1"
              onClick={() => handleRemove(skill)}
              aria-label="Remove"
            />
          </span>
        ))}
      </div>

      <input
        type="text"
        className="form-control"
        placeholder="Type to add skill..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            handleAdd(query)
          }
        }}
      />

      {query && (
        <ul className="list-group mt-2">
          {filtered.map((skill) => (
            <li
              key={skill.id}
              className="list-group-item list-group-item-action"
              onClick={() => handleAdd(skill.name)}
              style={{ cursor: 'pointer' }}
            >
              {skill.name}
            </li>
          ))}
          {!filtered.length && (
            <li
              className="list-group-item list-group-item-warning"
              onClick={() => handleAdd(query)}
              style={{ cursor: 'pointer' }}
            >
              ➕ Add new skill: <strong>{query}</strong>
            </li>
          )}
        </ul>
      )}
    </div>
  )
}

const JobSeekerProfileForm: React.FC = () => {

  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<JobSeekerProfileFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    location: '',
    role: '',
    industry: '',
    about: '',
    skills: [],
    educations: [{
      institution: '',
      degree: '',
      field_of_study: '',
      start_date: '',
      end_date: '',
      description: '',
    }],
    certifications: [{
      name: '',
      issuer: '',
      issue_date: '',
      expiration_date: '',
      credential_url: '',
    }]
  });

  const [allSkills, setAllSkills] = useState<Skill[]>([]);

  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    axios.get<Skill[]>('/api/skills/')
      .then(res => setAllSkills(res.data))
      .catch(err => console.error("Failed to load skills", err));
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    field: string,
    index?: number,
    section?: keyof JobSeekerProfileFormData
  ) => {
    if (section !== undefined && index !== undefined) {
      const items = [...(formData[section] as any[])];
      items[index][field] = e.target.value;
      setFormData({ ...formData, [section]: items });
    } else {
      setFormData({ ...formData, [field]: e.target.value });
    }
  };

  const addSection = (section: 'educations' | 'certifications') => {
    const blankItem = Object.fromEntries(Object.keys(formData[section][0]).map(k => [k, '']));
    setFormData(prev => ({
      ...prev,
      [section]: [...(prev[section] as any[]), blankItem],
    }));
  };

  const removeSection = (section: 'educations' | 'certifications', index: number) => {
    if (index === 0) return; // ❌ Don't allow deleting the first one
    const updated = [...formData[section]];
    updated.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      [section]: updated,
    }));
  };

  const getCookie = (name: string): string | null => {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const trimmed = cookie.trim();
      if (trimmed.startsWith(name + '=')) {
        return decodeURIComponent(trimmed.substring(name.length + 1));
      }
    }
    return null;
  };

  const handleSubmit = (e: FormEvent) => {

    const normalizeDate = (dateStr: string) => {
      return dateStr.split('T')[0]; // If ISO string like "2025-06-20T00:00:00"
    };

    const cleanedCerts = formData.certifications.map(cert => ({
      ...cert,
      issue_date: normalizeDate(cert.issue_date),
      expiration_date: normalizeDate(cert.expiration_date),
    }));

    const cleanedEducations = formData.educations.map(edu => ({
      ...edu,
      start_date: normalizeDate(edu.start_date),
      end_date: normalizeDate(edu.end_date),
    }));

    const payload = {
      ...formData,
      certifications: cleanedCerts,
      educations: cleanedEducations,
    };

    e.preventDefault();
    setSubmitting(true);
    axios.post('/api/jobseeker/create/', payload, {
      headers: {
        'X-CSRFToken': getCookie('csrftoken'),
      }
    })
      .then(() => {
        window.location.href = '/job_seeker_dashboard/';
      })
      .catch(err => {
        console.error("Submission error:", err.response?.data || err);
        const msg =
          err.response?.data?.message ||
          err.response?.data?.detail ||
          'Something went wrong. Please try again.';
        setErrorMessage(msg);
        setSubmitting(false); // 👈 ADD THIS
      });
  };

  return (
     <div className="container my-5">
      {errorMessage && (
        <div className="alert alert-danger" role="alert">
          {errorMessage}
        </div>
      )}
      <form onSubmit={handleSubmit} className="p-4 border rounded shadow-sm bg-white">
        <h2 className="mb-4 text-center text-primary">Create Your Profile</h2>
        {/* Basic Info Section */}
        <div className="mb-4 p-3 border rounded bg-light">
          <h3 className="mb-3">Basic Info</h3>
          <div className="row g-3">
            <div className="col-md-6">
              <label htmlFor="firstName" className="form-label">First Name: </label>
              <input placeholder="First Name" value={formData.first_name} onChange={e => handleChange(e, 'first_name')} />
            </div>
            <div className="col-md-6">
              <label htmlFor="last_name" className="form-label">Last Name: </label>
              <input placeholder="Last Name" value={formData.last_name} onChange={e => handleChange(e, 'last_name')} />
            </div>
            <div className="col-md-6">
              <label htmlFor="email" className="form-label">Email: </label>
              <input type="email" placeholder="Email" value={formData.email} onChange={e => handleChange(e, 'email')} />
            </div>
            <div className="col-md-6">
              <label htmlFor="phone_number" className="form-label">Phone number: </label>
              <input placeholder="Phone" value={formData.phone_number} onChange={e => handleChange(e, 'phone_number')} />
            </div>
            <div className="col-md-6">
              <label htmlFor="location" className="form-label">Location: </label>
              <input placeholder="Location" value={formData.location} onChange={e => handleChange(e, 'location')} />
            </div>
            <div className="col-md-6">
              <label htmlFor="Role" className="form-label">Role: </label>
              <input placeholder="Role" value={formData.role} onChange={e => handleChange(e, 'role')} />
            </div>
            <div className="col-md-6">
              <label htmlFor="insdustry" className="form-label">Industry: </label>
              <input placeholder="Industry" value={formData.industry} onChange={e => handleChange(e, 'industry')} />
            </div>
            <div className="col-md-6">
              <label htmlFor="about" className="form-label">About: </label>
              <textarea placeholder="About You" value={formData.about} onChange={e => handleChange(e, 'about')} />
            </div>
          </div>
        </div>
        {/* Skills Section */}
        <SkillInput
          allSkills={allSkills}
          onSkillsChange={(skills) => {
            setFormData({ ...formData, skills });
          }}
        />
        {/* Education Section */}
        <div className="mb-4 p-3 border rounded bg-light">
          <h3 className="mb-3">Education</h3>
            {formData.educations.map((edu, i) => (
              <div key={i}>
                <div className="row g-3">
                  <div className="col-md-4">
                      <label htmlFor="institution" className="form-label">Institution: </label>
                      <input placeholder="Institution" value={edu.institution} onChange={e => handleChange(e, 'institution', i, 'educations')} />
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="degree" className="form-label">Degree: </label>
                    <input placeholder="Degree" value={edu.degree} onChange={e => handleChange(e, 'degree', i, 'educations')} />
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="field_of_study" className="form-label">Field of Study: </label>
                    <input placeholder="Field of Study" value={edu.field_of_study} onChange={e => handleChange(e, 'field_of_study', i, 'educations')} />
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="start_date" className="form-label">Start date: </label>
                    <input placeholder="Start Date" type="date" value={edu.start_date} onChange={e => handleChange(e, 'start_date', i, 'educations')} />
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="end_date" className="form-label">End date: </label>
                    <input placeholder="End Date" type="date" value={edu.end_date} onChange={e => handleChange(e, 'end_date', i, 'educations')} />
                  </div>
                  <div className="col-md-4"></div>
                  <div className="col-md-12">
                    <label htmlFor="description" className="form-label">Description: </label>              
                    <textarea placeholder="Description" value={edu.description} onChange={e => handleChange(e, 'description', i, 'educations')} />
                  </div>
                  <div className="col-md-4">
                    {i > 0 && (
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => removeSection('educations', i)}
                      >
                        ✕ Remove Education
                      </button>
                    )}
                  </div>
                  <br></br>
                </div>
              <hr></hr>
              </div>
            ))}
            <button type="button" onClick={() => addSection('educations')}>+ Add Education</button>
        </div>
        {/* Certification Section */}
        <div className="mb-4 p-3 border rounded bg-light">
          <h3 className="mb-3">Certifications</h3>
            {formData.certifications.map((cert, i) => (
              <div key={i}>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label htmlFor="name" className="form-label">Name: </label>
                    <input placeholder="Name" value={cert.name} onChange={e => handleChange(e, 'name', i, 'certifications')} />
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="issuer" className="form-label">Issuer: </label>
                    <input placeholder="Issuer" value={cert.issuer} onChange={e => handleChange(e, 'issuer', i, 'certifications')} />
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="issue_date" className="form-label">Issue date: </label>
                    <input type="date" placeholder="Issue Date" value={cert.issue_date} onChange={e => handleChange(e, 'issue_date', i, 'certifications')} />
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="expiration_date" className="form-label">Expiration date: </label>
                    <input type="date" placeholder="Expiration Date" value={cert.expiration_date} onChange={e => handleChange(e, 'expiration_date', i, 'certifications')} />
                  </div>
                  <div className="col-md-8">
                    <label htmlFor="credential_url" className="form-label">Credential URL: </label>
                    <input type="url" placeholder="Credential URL" value={cert.credential_url} onChange={e => handleChange(e, 'credential_url', i, 'certifications')} />
                  </div>
                <div className="col-md-4">
                    {i > 0 && (
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => removeSection('certifications', i)}
                      >
                        ✕ Remove Certification
                      </button>
                    )}
                  </div>
                  <br></br>
                </div>
                <hr></hr>
              </div>
            ))}
            <button type="button" onClick={() => addSection('certifications')}>+ Add Certification</button>
        </div>
        <div className="mb-4 p-3 border rounded bg-light">
          <h3 className="mb-3">Resume</h3>
          <input className="form-control form-control-lg" id="formFileLg" type="file"></input>
        </div>
        <br />
        <button type="submit" disabled={submitting}>
  {submitting ? "Submitting..." : "Submit Profile"}
</button>
      </form>
    </div>
  );
};

export default JobSeekerProfileForm;