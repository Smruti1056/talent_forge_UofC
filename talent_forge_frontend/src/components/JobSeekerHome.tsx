import { Card, CardContent } from "./card";
import { BadgeCheck, Bookmark, User, FileText } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
const data = [
  { name: 'Declined', value: 3 },
  { name: 'Interview', value: 2 },
  { name: 'No response', value: 5 },
];
import Header from "./HeaderBar";
const COLORS = ["#D88288", "#81A67C", "#9FAAAB"];

const JobSeekerHome = () => {
  return (
    <div>
      <Header />
      <div className="page">
        <h2 className="title">Hi Jane! Here’s a quick look at your journey</h2>

        <div className="grid">
          {/* Chart Card */}
          <Card className="card">
            <CardContent>
              <h3 className="section-title">An Overview of applied jobs</h3>
              <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                          {/* <defs>
                              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                              <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#999" />
                              </filter>
                          </defs>*/}
                          <Pie
                              data={data}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              /*filter="url(#shadow)"*/
                              label={({ name }) => name} // <-- Add this to display names
                              >
                              {data.map((_, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                              </Pie>
                      <Tooltip />
                      </PieChart>
                  </ResponsiveContainer>
                  </div>

            </CardContent>
          </Card>

          {/* Skills Card */}
          <Card className="card">
            <CardContent>
              <div className="skills-header">
                <h3 className="section-title">Skills</h3>
                <button className="update-btn">Update</button>
              </div>
              {[
                { name: "React", years: "3 years" },
                { name: "Angular JS", years: "2 years" },
                { name: "Python", years: "3 years" },
              ].map((skill) => (
                <div key={skill.name} className="skill-item">
                  <BadgeCheck className="icon green" />
                  <span className="skill-name">{skill.name}</span>
                  <span className="skill-years">{skill.years} of experience</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Activity Card */}
          <Card className="card">
            <CardContent>
              <h3 className="section-title">Activity</h3>
              <ul className="activity-list">
                <li>✓ Applied to xyz inc. 1 day ago</li>
                <li>✓ Last updated your resume 12 days ago</li>
                <li>✓ Last Login: June 20, 2025 Friday @ 5pm</li>
                <li>✓ Next password reset in 30 days!!</li>
              </ul>
            </CardContent>
          </Card>

          {/* Saved Jobs Card */}
          <Card className="card">
          <CardContent>
              <h3 className="section-title">Saved Jobs</h3>
              <ul className="saved-jobs-list">
              <li>
                  <a href="/jobs/full-stack-developer" className="saved-job-link">
                  <Bookmark className="icon" /> Full stack developer
                  </a>
              </li>
              <li>
                  <a href="/jobs/software-architect" className="saved-job-link">
                  <Bookmark className="icon" /> Software Architect
                  </a>
              </li>
              <li>
                  <a href="/jobs/lead-developer" className="saved-job-link">
                  <Bookmark className="icon" /> Lead Developer
                  </a>
              </li>
              </ul>
          </CardContent>
          </Card>


          {/* Quick Links Card */}
          <Card className="card">
            <CardContent>
              <h3 className="section-title">Quick Links</h3>
              <div className="quick-links">
                <button className="update-btn">
                  <User className="icon" /> Update Profile
                </button>
                <button className="update-btn">
                  <FileText className="icon" /> Update Resume
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JobSeekerHome;
