import { Briefcase, Users } from "lucide-react";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Header from "./HeaderBar";

const candidateData = [
  { stage: "Applied", count: 67 },
  { stage: "Under review", count: 38 },
  { stage: "Interview", count: 23 },
  { stage: "Selected", count: 9 },
  { stage: "Declined", count: 58 },
];

type EmployerProfile = {
  company_name: string;
  email: string;
  industry: string;
  // Add more fields as needed
};

const EmployerHome = () => {

  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  
  useEffect(() => {
    fetch("/api/employer/profile/")
      .then((res) => res.json())
      .then((data) => setProfile(data));
  }, []);

  if (!profile) return <p>Loading...</p>;


  return (
    <>
    <Header />
    <div className="employer-home-wrapper">
      <h1 className="heading">Hello {profile.company_name}!</h1>

      <div className="card">
        <h2 className="card-title">
          <Users className="icon" /> Candidate Pipeline
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={candidateData} margin={{ top: 10, right: 0, left: 0, bottom: 10 }}>
            <XAxis dataKey="stage" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#CED3CD" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h2 className="card-title">
          <Briefcase className="icon" /> Job Post Summary
        </h2>
        <div className="summary-grid">
          <div className="summary-item">
            <p>Total Positions</p>
            <strong>50</strong>
          </div>
          <div className="summary-item">
            <p>Open Positions</p>
            <strong>10</strong>
          </div>
          <div className="summary-item">
            <p>Closed Positions</p>
            <strong>5</strong>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default EmployerHome;
