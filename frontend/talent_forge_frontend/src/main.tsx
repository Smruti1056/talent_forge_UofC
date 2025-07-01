// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import JobSeekerProfileForm from './components/JobSeekerProfileForm';
import { BrowserRouter } from 'react-router-dom';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter>
        <JobSeekerProfileForm />
      </BrowserRouter>
    </React.StrictMode>
  );
}
