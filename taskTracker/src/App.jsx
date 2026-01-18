import { useState, useEffect } from 'react'
import './App.css'

const AGENTS = ["Mcquinley Josh Maglangit", "Phillip John Mamac", "Nahre Fuentes", "Ark Von Ryan Guillema", "Angel Pink Librada"];
const JOBS = ["Bidding - Seller Appeal", "Inherit Traffic Daily QC", "Inherit Traffic High Imp", "Bidding - Winner Pool QC", "Bidding - Winner Pool QC 1/6", "Bidding - Winner Pool QC 2/6", "Bidding - Winner Pool QC 3/6", "Bidding - Winner Pool QC 4/6", "Bidding - Winner Pool QC 5/6", "Bidding - Winner Pool QC 6/6"];
const ANSWERS = [{ label: "Yes", value: "Yes" }, { label: "No", value: "No" }];

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('app-theme') || 'emerald');

  const [globalData, setGlobalData] = useState(() => {
    const saved = localStorage.getItem('global-data');
    return saved ? JSON.parse(saved) : { agentName: '', date: '' };
  });

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('tasks-data');
    return saved ? JSON.parse(saved) : Array(100).fill({
      jobTitle: '', startTime: '', endTime: '',
      taskID: '', answer: '', timeSpent: ''
    });
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    localStorage.setItem('tasks-data', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('global-data', JSON.stringify(globalData));
  }, [globalData]);

  useEffect(() => {
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const handleGlobalChange = (field, value) => {
    setGlobalData(prev => ({ ...prev, [field]: value }));
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

  const clearAll = () => {
    if (window.confirm("Clear all data?")) {
      setTasks(Array(100).fill({ jobTitle: '', startTime: '', endTime: '', taskID: '', answer: '', timeSpent: '' }));
    }
  };

  const handleSubmit = async () => {
    if (!globalData.agentName || !globalData.date) {
      alert("Select Agent and Date first.");
      return;
    }
    const finalData = tasks.map((t, index) => {
      const master = tasks[Math.floor(index / 10) * 10];
      return {
        agentName: globalData.agentName, date: globalData.date,
        projectNo: Math.floor(index / 10) + 1, taskNo: (index % 10) + 1,
        jobTitle: master.jobTitle, startTime: master.startTime,
        endTime: master.endTime, timeSpent: master.timeSpent,
        taskID: t.taskID, answer: t.answer
      };
    }).filter(t => t.taskID.trim() !== "" || t.answer !== "");

    if (finalData.length === 0) return alert("No data to submit.");
    setIsSubmitting(true);
    try {
      const URL = "https://script.google.com/macros/s/AKfycbzz-LyLUrN5nm8Ow-bNYpvgnIlNkKvShjslLbcIwSObmjkGWutZYhvLixuO1p0aiUTh5A/exec";
      await fetch(URL, { method: "POST", mode: "no-cors", body: JSON.stringify(finalData) });
      alert(`Success! ${finalData.length} uploaded.`);
      if (window.confirm("Clear board for next batch?")) {
        setTasks(Array(100).fill({ jobTitle: '', startTime: '', endTime: '', taskID: '', answer: '', timeSpent: '' }));
      }
    } catch (e) {
      alert("Submission failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container" data-theme={theme}>
      <div className="header-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <h2>Efficiency Tracker</h2>
          <div className="theme-controls">
            <button className="theme-btn btn-light" onClick={() => setTheme('light')}></button>
            <button className="theme-btn btn-dark" onClick={() => setTheme('dark')}></button>
            <button className="theme-btn btn-emerald" onClick={() => setTheme('emerald')}></button>
            <button className="theme-btn btn-cyber" onClick={() => setTheme('cyber')}></button>
          </div>
        </div>
        <div className="global-inputs">
          <select value={globalData.agentName} onChange={(e) => handleGlobalChange('agentName', e.target.value)}>
            <option value="">Select Agent...</option>
            {AGENTS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <input type="date" value={globalData.date} onChange={(e) => handleGlobalChange('date', e.target.value)} />
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Project</th><th>Task</th><th>Job Title</th><th>Task ID</th>
              <th>Start</th><th>End</th><th>Min</th><th>Answer</th>
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
                    <select value={isFirst ? task.jobTitle : master.jobTitle} disabled={!isFirst} 
                      onChange={(e) => handleTaskChange(index, 'jobTitle', e.target.value)}
                      className={!isFirst ? "inherited-field" : ""}>
                      <option value="">Select Job...</option>
                      {JOBS.map(j => <option key={j} value={j}>{j}</option>)}
                    </select>
                  </td>
                  <td><input type="text" value={task.taskID} onChange={(e) => handleTaskChange(index, 'taskID', e.target.value)} placeholder="-" /></td>
                  <td><input type="time" value={isFirst ? task.startTime : master.startTime} disabled={!isFirst}
                    onChange={(e) => handleTaskChange(index, 'startTime', e.target.value)} className={!isFirst ? "inherited-field" : ""} /></td>
                  <td><input type="time" value={isFirst ? task.endTime : master.endTime} disabled={!isFirst}
                    onChange={(e) => handleTaskChange(index, 'endTime', e.target.value)} className={!isFirst ? "inherited-field" : ""} /></td>
                  <td className="auto-field">{master.timeSpent || '-'}</td>
                  <td>
                    <select value={task.answer} onChange={(e) => handleTaskChange(index, 'answer', e.target.value)}>
                      <option value="">-</option>
                      {ANSWERS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="footer-area">
        <button className="clear-btn" onClick={clearAll} disabled={isSubmitting}>Clear Board</button>
        <button className="submit-btn" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Uploading..." : "Submit All"}
        </button>
      </div>
    </div>
  );
}

export default App;