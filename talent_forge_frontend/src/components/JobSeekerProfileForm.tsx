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

type Skill = {
  id: string;
  name: string;
};

type JobExperience = {
  company_name: string;
  position: string;
  start_date: string;
  end_date: string;
  location: string;
  responsibilities: string;
};

type JobSeekerProfileFormData = {
  first_name: string;
  last_name: string;
  phone_number: string;
  location: string;
  role: string;
  industry: string;
  about: string;
  skills: string[]; // IDs of skills
  educations: Education[];
  certifications: Certification[];
  job_experiences: JobExperience[];
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
    }],
    job_experiences: [{
    company_name: '',
    position: '',
    start_date: '',
    end_date: '',
    location: '',
    responsibilities: '',
  }],
  });

  const [allSkills, setAllSkills] = useState<Skill[]>([]);

  const [errorMessage, setErrorMessage] = useState('');

  const [termsAccepted, setTermsAccepted] = useState(false);

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

  const addSection = (section: 'educations' | 'certifications' | 'job_experiences') => {
    const blankItem = Object.fromEntries(Object.keys(formData[section][0]).map(k => [k, '']));
    setFormData(prev => ({
      ...prev,
      [section]: [...(prev[section] as any[]), blankItem],
    }));
  };

  const removeSection = (section: 'educations' | 'certifications' | 'job_experiences', index: number) => {
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

    e.preventDefault();

    // --- NEW: Client-side validation for terms acceptance ---
    if (!termsAccepted) {
      setErrorMessage('Please read and accept the Terms of Service to submit your profile.');
      return; // Stop the submission
    }

    setSubmitting(true);
    setErrorMessage(''); // Clear previous errors

    const normalizeDate = (dateStr: string) => {
      return dateStr.split('T')[0]; // If ISO string like "2025-06-20T00:00:00"
    };

    const cleanedCerts = formData.certifications
    .filter(cert =>
      cert.name.trim() !== '' ||
      cert.issuer.trim() !== '' ||
      cert.issue_date.trim() !== '' ||
      cert.expiration_date.trim() !== '' ||
      cert.credential_url.trim() !== ''
    )
    .map(cert => ({
      ...cert,
      issue_date: normalizeDate(cert.issue_date),
      expiration_date: normalizeDate(cert.expiration_date),
    }));

    const cleanedEducations = formData.educations.map(edu => ({
      ...edu,
      start_date: normalizeDate(edu.start_date),
      end_date: normalizeDate(edu.end_date),
    }));

    const cleanedExperiences = formData.job_experiences.map(exp => ({
      ...exp,
      start_date: normalizeDate(exp.start_date),
      end_date: normalizeDate(exp.end_date),
    }));


    const payload = {
      ...formData,
      certifications: cleanedCerts,
      educations: cleanedEducations,
      job_experiences: cleanedExperiences,
    };

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
      <form onSubmit={handleSubmit} className="p-4 border rounded shadow-sm bg-white text-dark" >
        <h2 className="mb-4 text-center">Create Your Profile</h2>
        {/* Basic Info Section */}
        <div className="mb-4 p-3 border rounded bg-light">
          <h3 className="mb-3">Basic Info</h3>
          <hr></hr>
          <div className="row"> {/* This 'row' will contain your two form-groups */}
            <div className="col-md-6"> {/* First column, takes up half width on medium and larger screens */}
              <div className="form-group row"> {/* Original form-group for Email */}
                <label htmlFor="firstName" className="col-sm-2 col-form-label">First Name: </label>
                <div className="col-sm-10">
                  <input className="form-control" placeholder="First Name" value={formData.first_name} onChange={e => handleChange(e, 'first_name')} />
                </div>
              </div>
            </div>
            <div className="col-md-6"> {/* Second column, takes up half width on medium and larger screens */}
              <div className="form-group row"> {/* Original form-group for Password */}
                <label htmlFor="last_name" className="col-sm-2 col-form-label">Last Name: </label>
                <div className="col-sm-10">
                  <input className="form-control" placeholder="Last Name" value={formData.last_name} onChange={e => handleChange(e, 'last_name')} />
                </div>
              </div>
            </div>
          </div>
          <hr></hr>
          <div className="row"> {/* This 'row' will contain your two form-groups */}
            <div className="col-md-6"> {/* First column, takes up half width on medium and larger screens */}
              <div className="form-group row"> {/* Original form-group for Email */}
                <label htmlFor="location" className="col-sm-2 col-form-label">Location: </label>
                <div className="col-sm-10">
                  <input className="form-control" placeholder="Location" value={formData.location} onChange={e => handleChange(e, 'location')} />
                </div>
              </div>
            </div>
            <div className="col-md-6"> {/* Second column, takes up half width on medium and larger screens */}
              <div className="form-group row"> {/* Original form-group for Password */}
                <label htmlFor="phone_number" className="col-sm-2 col-form-label">Phone number: </label>
                <div className="col-sm-10">
                  <input className="form-control" placeholder="Phone" value={formData.phone_number} onChange={e => handleChange(e, 'phone_number')} />
                </div>
              </div>
            </div>
          </div>
          <hr></hr>
          <div className="row"> {/* This 'row' will contain your two form-groups */}
            <div className="col-md-6"> {/* First column, takes up half width on medium and larger screens */}
              <div className="form-group row"> {/* Original form-group for Email */}
                <label htmlFor="insdustry" className="col-sm-2 col-form-label">Industry: </label>
                <div className="col-sm-10">
                  <input className="form-control" placeholder="Industry" value={formData.industry} onChange={e => handleChange(e, 'industry')} />
                </div>
              </div>
            </div>
            <div className="col-md-6"> {/* Second column, takes up half width on medium and larger screens */}
              <div className="form-group row"> {/* Original form-group for Password */}
                <label htmlFor="Role" className="col-sm-2 col-form-label">Role: </label>
                <div className="col-sm-10">
                  <input className="form-control" placeholder="Role" value={formData.role} onChange={e => handleChange(e, 'role')} />
                </div>
              </div>
            </div>
          </div>
          <hr></hr>
          <div className="row"> {/* This 'row' will contain your two form-groups */}
            <div className="col-md-12"> {/* Second column, takes up half width on medium and larger screens */}
              <div className="form-group row"> {/* Original form-group for Password */}
              <label htmlFor="about" className="col-sm-2 col-form-label">About: </label>
                <div className="col-sm-10">
                  <textarea className="form-control" placeholder="About You" value={formData.about} onChange={e => handleChange(e, 'about')} />
                </div>
              </div>
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

        {/* Job Experience Section */}
        <div className="mb-4 p-3 border rounded bg-light">
          <h3 className="mb-3">Job Experience</h3>
          <hr />
          {formData.job_experiences.map((exp, i) => (
            <div key={i}>
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group row">
                    <label className="col-sm-3 col-form-label">Company:</label>
                    <div className="col-sm-9">
                      <input className="form-control" placeholder="Company Name" value={exp.company_name} onChange={e => handleChange(e, 'company_name', i, 'job_experiences')} />
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group row">
                    <label className="col-sm-3 col-form-label">Position:</label>
                    <div className="col-sm-9">
                      <input className="form-control" placeholder="Position" value={exp.position} onChange={e => handleChange(e, 'position', i, 'job_experiences')} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="row mt-2">
                <div className="col-md-6">
                  <div className="form-group row">
                    <label className="col-sm-3 col-form-label">Start Date:</label>
                    <div className="col-sm-9">
                      <input className="form-control" type="date" value={exp.start_date} onChange={e => handleChange(e, 'start_date', i, 'job_experiences')} />
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group row">
                    <label className="col-sm-3 col-form-label">End Date:</label>
                    <div className="col-sm-9">
                      <input className="form-control" type="date" value={exp.end_date} onChange={e => handleChange(e, 'end_date', i, 'job_experiences')} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="row mt-2">
                <div className="col-md-6">
                  <div className="form-group row">
                    <label className="col-sm-3 col-form-label">Location:</label>
                    <div className="col-sm-9">
                      <input className="form-control" placeholder="Location" value={exp.location} onChange={e => handleChange(e, 'location', i, 'job_experiences')} />
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group row">
                    <label className="col-sm-3 col-form-label">Responsibilities:</label>
                    <div className="col-sm-9">
                      <textarea className="form-control" placeholder="Responsibilities" value={exp.responsibilities} onChange={e => handleChange(e, 'responsibilities', i, 'job_experiences')} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="row mt-3">
                <div className="col-md-4">
                  {i > 0 && (
                    <button type="button" className="btn btn-danger" 
                      onClick={() => removeSection('job_experiences', i)}>
                      ✕ Remove Experience
                    </button>
                  )}
                </div>
              </div>
              <hr />
            </div>
          ))}
          <button className="btn btn-secondary" type="button" onClick={() => addSection('job_experiences')}>
            + Add Job Experience
          </button>
        </div>

        {/* Education Section */}
        <div className="mb-4 p-3 border rounded bg-light">
          <h3 className="mb-3">Education</h3>
          <hr></hr>
            {formData.educations.map((edu, i) => (
              <div key={i}>
                <div className="row"> {/* This 'row' will contain your two form-groups */}
                  <div className="col-md-6"> {/* First column, takes up half width on medium and larger screens */}
                    <div className="form-group row"> {/* Original form-group for Email */}
                      <label htmlFor="institution" className="col-sm-2 col-form-label">Institution: </label>
                      <div className="col-sm-10">
                        <input className="form-control" placeholder="Institution" value={edu.institution} onChange={e => handleChange(e, 'institution', i, 'educations')} />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6"> {/* Second column, takes up half width on medium and larger screens */}
                    <div className="form-group row"> {/* Original form-group for Password */}
                      <label htmlFor="degree" className="col-sm-2 col-form-label">Degree: </label>
                      <div className="col-sm-10">
                        <input className="form-control" placeholder="Degree" value={edu.degree} onChange={e => handleChange(e, 'degree', i, 'educations')} />
                      </div>
                    </div>
                  </div>
                </div>
                <hr></hr>
                <div className="row"> {/* This 'row' will contain your two form-groups */}
                  <div className="col-md-6"> {/* First column, takes up half width on medium and larger screens */}
                    <div className="form-group row"> {/* Original form-group for Email */}
                      <label htmlFor="start_date" className="col-sm-2 col-form-label">Start date: </label>
                      <div className="col-sm-10">
                        <input className="form-control" placeholder="Start Date" type="date" value={edu.start_date} onChange={e => handleChange(e, 'start_date', i, 'educations')} />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6"> {/* Second column, takes up half width on medium and larger screens */}
                    <div className="form-group row"> {/* Original form-group for Password */}
                      <label htmlFor="end_date" className="col-sm-2 col-form-label">End date: </label>
                      <div className="col-sm-10">
                        <input className="form-control" placeholder="End Date" type="date" value={edu.end_date} onChange={e => handleChange(e, 'end_date', i, 'educations')} />
                      </div>
                    </div>
                  </div>
                </div>
                <hr></hr>
                <div className="row"> {/* This 'row' will contain your two form-groups */}
                  <div className="col-md-6"> {/* First column, takes up half width on medium and larger screens */}
                    <div className="form-group row"> {/* Original form-group for Email */}
                      <label htmlFor="field_of_study" className="col-sm-2 col-form-label">Field of Study: </label>
                      <div className="col-sm-10">
                        <input className="form-control" placeholder="Field of Study" value={edu.field_of_study} onChange={e => handleChange(e, 'field_of_study', i, 'educations')} />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6"> {/* Second column, takes up half width on medium and larger screens */}
                    <div className="form-group row"> {/* Original form-group for Password */}
                      <label htmlFor="description" className="col-sm-2 col-form-label">Description: </label>
                      <div className="col-sm-10">
                        <textarea className="form-control" placeholder="Description" value={edu.description} onChange={e => handleChange(e, 'description', i, 'educations')} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row g-3">
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
            <button className='btn btn-secondary' type="button" onClick={() => addSection('educations')}>+ Add Education</button>
        </div>
        {/* Certification Section */}
        <div className="mb-4 p-3 border rounded bg-light">
          <h3 className="mb-3">Certifications</h3>
          <hr></hr>
            {formData.certifications.map((cert, i) => (
              <div key={i}>
                <div className="row"> {/* This 'row' will contain your two form-groups */}
                  <div className="col-md-6"> {/* First column, takes up half width on medium and larger screens */}
                    <div className="form-group row"> {/* Original form-group for Email */}
                      <label htmlFor="name" className="col-sm-2 col-form-label">Name: </label>
                      <div className="col-sm-10">
                        <input className="form-control" placeholder="Name" value={cert.name} onChange={e => handleChange(e, 'name', i, 'certifications')} />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6"> {/* Second column, takes up half width on medium and larger screens */}
                    <div className="form-group row"> {/* Original form-group for Password */}
                      <label htmlFor="issuer" className="col-sm-2 col-form-label">Issuer: </label>
                      <div className="col-sm-10">
                        <input className="form-control" placeholder="Issuer" value={cert.issuer} onChange={e => handleChange(e, 'issuer', i, 'certifications')} />
                      </div>
                    </div>
                  </div>
                </div>
                <hr></hr>
                <div className="row"> {/* This 'row' will contain your two form-groups */}
                  <div className="col-md-6"> {/* First column, takes up half width on medium and larger screens */}
                    <div className="form-group row"> {/* Original form-group for Email */}
                      <label htmlFor="issue_date" className="col-sm-2 col-form-label">Issue date: </label>
                      <div className="col-sm-10">
                        <input className="form-control" type="date" placeholder="Issue Date" value={cert.issue_date} onChange={e => handleChange(e, 'issue_date', i, 'certifications')} />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6"> {/* Second column, takes up half width on medium and larger screens */}
                    <div className="form-group row"> {/* Original form-group for Password */}
                      <label htmlFor="expiration_date" className="col-sm-2 col-form-label">Expiration date: </label>
                      <div className="col-sm-10">
                        <input className="form-control" type="date" placeholder="Expiration Date" value={cert.expiration_date} onChange={e => handleChange(e, 'expiration_date', i, 'certifications')} />
                      </div>
                    </div>
                  </div>
                </div>
                <hr></hr>
                <div className="col-md-6"> {/* First column, takes up half width on medium and larger screens */}
                    <div className="form-group row"> {/* Original form-group for Email */}
                      <label htmlFor="credential_url" className="col-sm-2 col-form-label">Credential URL: </label>
                      <div className="col-sm-10">
                        <input className="form-control" type="url" placeholder="Credential URL" value={cert.credential_url} onChange={e => handleChange(e, 'credential_url', i, 'certifications')} />
                      </div>
                    </div>
                  </div>
                <div className="row g-3">
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
            <button className="btn btn-secondary" type="button" onClick={() => addSection('certifications')}>+ Add Certification</button>
        </div>
        {/* Resume Section */}
        <div className="mb-4 p-3 border rounded bg-light">
          <h3 className="mb-3">Resume</h3>
          <input className="form-control form-control-lg" id="formFileLg" type="file"></input>
        </div>
        {/* --- NEW: Terms of Service Section --- */}
        <div className="mb-4 p-3 border rounded bg-light">
            <h3 className="mb-3">Terms of Service</h3>
            <div className="terms-scroll-box mb-3 p-3 border rounded bg-white" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {/* Replace with your actual Terms of Service content */}
                <p>
                  By submitting your profile, you agree to the following terms and conditions:
                </p>
                <p>
                  1. Data Collection and Usage: We collect and store the personal information you provide in this profile (e.g., name, email, phone number, location, skills, education, certifications, and resume). This data will be used solely for the purpose of connecting you with potential employers, job opportunities, and improving our services. We will not sell your data to third parties.
                </p>
                <p>
                  2. Information Accuracy: You are responsible for ensuring the accuracy and completeness of the information provided in your profile. Misleading or false information may result in the suspension or termination of your account.
                </p>
                <p>
                  3. Resume Upload: Any resume uploaded will be scanned for relevant keywords and shared with prospective employers who match your profile. Please ensure your resume does not contain sensitive personal information that you do not wish to share with potential employers.
                </p>
                <p>
                  4. Communication: By providing your contact information, you consent to receive communications from us regarding job opportunities, platform updates, and other relevant information. You can opt-out of certain communications at any time.
                </p>
                <p>
                  5. Data Security: We implement reasonable security measures to protect your personal data from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or method of electronic storage is 100% secure.
                </p>
                <p>
                  6. Changes to Terms: We reserve the right to modify these Terms of Service at any time. We will notify you of any significant changes, and your continued use of the service constitutes acceptance of the updated terms.
                </p>
                <p>
                  7. Disclaimer: We do not guarantee job placement or employment. Our service facilitates connections between job seekers and employers, but the final hiring decisions rest solely with the employers.
                </p>
                <p>
                  8. Governing Law: These terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.
                </p>
                <p>
                  If you do not agree to these terms, please do not submit your profile.
                </p>
            </div>
            <div className="form-check">
                <input
                    className="form-check-input"
                    type="checkbox"
                    id="termsCheckbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="termsCheckbox">
                    I have read and agree to the <a href="#" onClick={(e) => { e.preventDefault(); /* Optional: scroll to top of terms box or open a modal */ }}>Terms of Service</a>
                </label>
            </div>
        </div>
        {/* --- END: Terms of Service Section --- */}
        {/* --- Submit Button --- */}
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Profile"}
        </button>
      </form>
    </div>
  );
};

export default JobSeekerProfileForm;