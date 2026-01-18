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
    return saved ? JSON.parse(saved) : Array(100).fill({ jobTitle: '', startTime: '', endTime: '', taskID: '', answer: '', timeSpent: '' });
  });

  useEffect(() => localStorage.setItem('tasks-data', JSON.stringify(tasks)), [tasks]);
  useEffect(() => localStorage.setItem('global-data', JSON.stringify(globalData)), [globalData]);
  useEffect(() => localStorage.setItem('app-theme', theme), [theme]);

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

  return (
    <div className="container" data-theme={theme}>
      <header className="header-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <h2>Efficiency Tracker</h2>
          <div className="theme-controls">
            {['light', 'dark', 'emerald', 'cyber'].map(t => (
              <button key={t} className={`theme-btn btn-${t}`} onClick={() => setTheme(t)} />
            ))}
          </div>
        </div>
        <div className="global-inputs">
          <select value={globalData.agentName} onChange={(e) => setGlobalData({...globalData, agentName: e.target.value})}>
            <option value="">Select Agent...</option>
            {AGENTS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <input type="date" value={globalData.date} onChange={(e) => setGlobalData({...globalData, date: e.target.value})} />
        </div>
      </header>

      <main className="table-container">
        <table>
          <thead>
            <tr>
              <th>Proj</th><th>Task</th><th>Job Title</th><th>Task ID</th>
              <th>Start</th><th>End</th><th>Min</th><th>Answer</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, index) => {
              const isFirst = (index % 10) === 0;
              const master = tasks[Math.floor(index / 10) * 10];
              return (
                <tr key={index} className={isFirst ? "row-divider" : ""}>
                  <td className="auto-field" style={{width: '50px'}}>{Math.floor(index / 10) + 1}</td>
                  <td className="auto-field" style={{width: '50px'}}>{(index % 10) + 1}</td>
                  <td style={{width: '250px'}}>
                    <select value={isFirst ? task.jobTitle : master.jobTitle} disabled={!isFirst} 
                      onChange={(e) => handleTaskChange(index, 'jobTitle', e.target.value)}
                      className={!isFirst ? "inherited-field" : ""}>
                      <option value="">Select Job...</option>
                      {JOBS.map(j => <option key={j} value={j}>{j}</option>)}
                    </select>
                  </td>
                  <td><input type="text" value={task.taskID} onChange={(e) => handleTaskChange(index, 'taskID', e.target.value)} /></td>
                  <td style={{width: '130px'}}><input type="time" value={isFirst ? task.startTime : master.startTime} disabled={!isFirst}
                    onChange={(e) => handleTaskChange(index, 'startTime', e.target.value)} className={!isFirst ? "inherited-field" : ""} /></td>
                  <td style={{width: '130px'}}><input type="time" value={isFirst ? task.endTime : master.endTime} disabled={!isFirst}
                    onChange={(e) => handleTaskChange(index, 'endTime', e.target.value)} className={!isFirst ? "inherited-field" : ""} /></td>
                  <td className="auto-field" style={{width: '60px'}}>{master.timeSpent || '-'}</td>
                  <td style={{width: '100px'}}>
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
      </main>

      <footer className="footer-area">
        <button className="clear-btn" onClick={() => setTasks(Array(100).fill({jobTitle:'',startTime:'',endTime:'',taskID:'',answer:'',timeSpent:''}))}>Clear Board</button>
        <button className="submit-btn">Submit All</button>
      </footer>
    </div>
  );
}

export default App;