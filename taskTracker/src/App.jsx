import { useState, useEffect } from 'react'
import './App.css'
import  LoginPage  from './components/LoginPage.jsx'

const AGENTS = ["Mcquinley Josh Maglangit", "Phillip John Mamac", "Nahre Fuentes", "Ark Von Ryan Guillema", "Angel Pink Librada"];
const JOBS = ["Bidding - Seller Appeal", "Inherit Traffic Daily QC", "Inherit Traffic High Imp", "Bidding - Winner Pool QC", "Bidding - Winner Pool QC 1/6", "Bidding - Winner Pool QC 2/6", "Bidding - Winner Pool QC 3/6", "Bidding - Winner Pool QC 4/6", "Bidding - Winner Pool QC 5/6", "Bidding - Winner Pool QC 6/6"];
const ANSWERS = [{ label: "Yes", value: "Yes" }, { label: "No", value: "No" }];

function getInitials(name) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function App() {

  const [theme, setTheme] = useState(() => localStorage.getItem('app-theme') || 'emerald');

  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem('auth-state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.isAuthenticated && parsed.agentName) {
          return parsed;
        }
      } catch {}
    }
    return { isAuthenticated: false, agentName: '', loginTime: '' };
  });

  const [globalData, setGlobalData] = useState(() => {
    const saved = localStorage.getItem('global-data');
    return saved ? JSON.parse(saved) : { agentName: '', date: '' };
  });

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('tasks-data');
    return saved ? JSON.parse(saved) : Array(100).fill({ jobTitle: '', startTime: '', endTime: '', taskID: '', answer: '', timeSpent: '' });
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => localStorage.setItem('tasks-data', JSON.stringify(tasks)), [tasks]);
  useEffect(() => localStorage.setItem('global-data', JSON.stringify(globalData)), [globalData]);
  useEffect(() => localStorage.setItem('app-theme', theme), [theme]);
  useEffect(() => localStorage.setItem('auth-state', JSON.stringify(auth)), [auth]);

  useEffect(() => {
    if (auth.isAuthenticated && auth.agentName && !globalData.agentName) {
      setGlobalData(prev => ({ ...prev, agentName: auth.agentName }));
    }
  }, [auth.isAuthenticated, auth.agentName]);

  const handleLogin = (agentName) => {
    const newAuth = {
      isAuthenticated: true,
      agentName,
      loginTime: new Date().toISOString(),
    };

    setAuth(newAuth);
    setGlobalData(prev => ({ ...prev, agentName }));
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      setAuth({ isAuthenticated: false, agentName: '', loginTime: '' });
      localStorage.removeItem('auth-state');
    }
  };

  const handleTaskChange = (index, field, value) => {
    const newTasks = [...tasks];
    let updatedTask = { ...newTasks[index], [field]: value };

    if (field === 'startTime' && value) {
      const [h, m] = value.split(':').map(Number);
      let endM = m + 25;
      let endH = (h + Math.floor(endM / 60)) % 24;
      updatedTask.endTime = `${String(endH).padStart(2, '0')}:${String(endM % 60).padStart(2, '0')}`;
      updatedTask.timeSpent = 25;
    }

    if (field === 'endTime' && updatedTask.startTime && value) {
      const [sH, sM] = updatedTask.startTime.split(':').map(Number);
      const [eH, eM] = value.split(':').map(Number);
      const diff = (eH * 60 + eM) - (sH * 60 + sM);
      updatedTask.timeSpent = diff < 0 ? diff + 1440 : diff;
    }

    newTasks[index] = updatedTask;
    setTasks(newTasks);
  };

  const handleSubmit = async () => {

    if (!globalData.agentName || !globalData.date)
      return alert("Select Agent and Date first.");

    const finalData = tasks.map((t, index) => {
      const master = tasks[Math.floor(index / 10) * 10];

      return {
        agentName: globalData.agentName,
        date: globalData.date,
        projectNo: Math.floor(index / 10) + 1,
        taskNo: (index % 10) + 1,
        jobTitle: master.jobTitle,
        startTime: master.startTime,
        endTime: master.endTime,
        timeSpent: master.timeSpent,
        taskID: t.taskID,
        answer: t.answer
      };

    }).filter(t => t.taskID.trim() !== "" || t.answer !== "");

    if (finalData.length === 0)
      return alert("No data to submit.");

    setIsSubmitting(true);

    try {

      const URL = "https://script.google.com/macros/s/AKfycbzz-LyLUrN5nm8Ow-bNYpvgnIlNkKvShjslLbcIwSObmjkGWutZYhvLixuO1p0aiUTh5A/exec";

      await fetch(URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(finalData)
      });

      alert(`Success! ${finalData.length} uploaded.`);

      if (window.confirm("Clear board?")) {

        setTasks(Array(100).fill({
          jobTitle: '',
          startTime: '',
          endTime: '',
          taskID: '',
          answer: '',
          timeSpent: ''
        }));

      }

    } catch (e) {

      alert("Submission failed.");

    } finally {

      setIsSubmitting(false);

    }

  };

  if (!auth.isAuthenticated) {
    return <LoginPage theme={theme} setTheme={setTheme} onLogin={handleLogin} />;
  }

  return (

    <div className="container" data-theme={theme}>

      <div className="header-section">

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <h2>CMI - Bidding Task Tracker</h2>

          <div className="theme-controls">
            {['light', 'dark', 'emerald', 'cyber'].map(t => (
              <button key={t} className={`theme-btn btn-${t}`} onClick={() => setTheme(t)} title={t}></button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>

          <div className="global-inputs">

            <select
              value={globalData.agentName}
              onChange={(e) => setGlobalData(prev => ({ ...prev, agentName: e.target.value }))}
            >
              <option value="">Select Agent...</option>
              {AGENTS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>

            <input
              type="date"
              value={globalData.date}
              onChange={(e) => setGlobalData(prev => ({ ...prev, date: e.target.value }))}
            />

          </div>

          <div className="user-badge">

            <div className="user-avatar">
              {getInitials(auth.agentName)}
            </div>

            <div className="user-info">
              <span className="user-name">{auth.agentName.split(' ')[0]}</span>
              <span className="user-role">Agent</span>
            </div>

          </div>

          <button className="logout-btn" onClick={handleLogout}>
            Sign Out
          </button>

        </div>

      </div>

      <div className="table-container">

        <table>

          <thead>
            <tr>
              <th style={{ width: '55px' }}>Proj</th>
              <th style={{ width: '55px' }}>Task</th>
              <th style={{ width: '280px' }}>Job Title</th>
              <th>Task ID</th>
              <th style={{ width: '135px' }}>Start</th>
              <th style={{ width: '135px' }}>End</th>
              <th style={{ width: '70px' }}>Min</th>
              <th style={{ width: '110px' }}>Answer</th>
            </tr>
          </thead>

          <tbody>

            {tasks.map((task, index) => {

              const isFirst = (index % 10) === 0;
              const master = tasks[Math.floor(index / 10) * 10];

              return (

                <tr key={index} className={isFirst ? "row-divider" : ""}>

                  <td className="auto-field">{Math.floor(index / 10) + 1}</td>
                  <td className="auto-field">{(index % 10) + 1}</td>

                  <td>
                    <select
                      value={isFirst ? task.jobTitle : master.jobTitle}
                      disabled={!isFirst}
                      onChange={(e) => handleTaskChange(index, 'jobTitle', e.target.value)}
                      className={!isFirst ? "inherited-field" : ""}
                    >
                      <option value="">Select Job...</option>
                      {JOBS.map(j => <option key={j} value={j}>{j}</option>)}
                    </select>
                  </td>

                  <td>
                    <input
                      type="text"
                      value={task.taskID}
                      onChange={(e) => handleTaskChange(index, 'taskID', e.target.value)}
                      placeholder="-"
                    />
                  </td>

                  <td>
                    <input
                      type="time"
                      value={isFirst ? task.startTime : master.startTime}
                      disabled={!isFirst}
                      onChange={(e) => handleTaskChange(index, 'startTime', e.target.value)}
                      className={!isFirst ? "inherited-field" : ""}
                    />
                  </td>

                  <td>
                    <input
                      type="time"
                      value={isFirst ? task.endTime : master.endTime}
                      disabled={!isFirst}
                      onChange={(e) => handleTaskChange(index, 'endTime', e.target.value)}
                      className={!isFirst ? "inherited-field" : ""}
                    />
                  </td>

                  <td className="auto-field">
                    {master.timeSpent || '-'}
                  </td>

                  <td>

                    <select
                      value={task.answer}
                      onChange={(e) => handleTaskChange(index, 'answer', e.target.value)}
                    >
                      <option value="">-</option>
                      {ANSWERS.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>

                  </td>

                </tr>

              );

            })}

          </tbody>

        </table>

      </div>

      <div className="footer-area">

        <button
          className="clear-btn"
          onClick={() => {
            if (window.confirm("Clear board?"))
              setTasks(Array(100).fill({
                jobTitle: '',
                startTime: '',
                endTime: '',
                taskID: '',
                answer: '',
                timeSpent: ''
              }))
          }}
          disabled={isSubmitting}
        >
          Clear Board
        </button>

        <button
          className="submit-btn"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Uploading..." : "Submit All"}
        </button>

      </div>

    </div>

  );

}

export default App;