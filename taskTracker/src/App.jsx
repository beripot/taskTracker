import { useState } from 'react'
import './App.css'

const AGENTS = [
  "Mcquinley Josh Maglangit",
  "Phillip John Mamac",
  "Nahre Fuentes",
  "Ark Von Ryan Guillema",
  "Angel Pink Librada"
];

const JOBS = [
  "Bidding - Seller Appeal", 
  "Inherit Traffic Daily QC", 
  "Inherit Traffic High Imp",
  "Bidding - Winner Pool QC", 
  "Bidding - Winner Pool QC 1/6", 
  "Bidding - Winner Pool QC 2/6",
  "Bidding - Winner Pool QC 3/6",
  "Bidding - Winner Pool QC 4/6",
  "Bidding - Winner Pool QC 5/6",
  "Bidding - Winner Pool QC 6/6",
];

const ANSWERS = [
  { label: "Yes, it's the same", value: "Yes" },
  { label: "No, it's not the same", value: "No" }
];

function App() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalData, setGlobalData] = useState({ agentName: '', date: '' });
  const [tasks, setTasks] = useState(Array(100).fill({
    jobTitle: '', startTime: '', endTime: '',
    taskID: '', answer: '', timeSpent: ''
  }));

  const handleGlobalChange = (field, value) => {
    setGlobalData(prev => ({ ...prev, [field]: value }));
  };

  const handleTaskChange = (index, field, value) => {
    const newTasks = [...tasks];
    let updatedTask = { ...newTasks[index], [field]: value };

    // Start Time Logic: Auto-set End Time +25 mins
    if (field === 'startTime') {
      if (value) {
        const [h, m] = value.split(':').map(Number);
        let endH = h;
        let endM = m + 25;
        if (endM >= 60) {
          endH = (endH + Math.floor(endM / 60)) % 24;
          endM = endM % 60;
        }
        const formattedEnd = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
        updatedTask.endTime = formattedEnd;
        updatedTask.timeSpent = 25;
      } else {
        updatedTask.endTime = '';
        updatedTask.timeSpent = '';
      }
    }

    // End Time Logic: Manual Calculation Override
    if (field === 'endTime') {
      const start = updatedTask.startTime;
      const end = value;
      if (start && end) {
        const [startH, startM] = start.split(':').map(Number);
        const [endH, endM] = end.split(':').map(Number);
        const diff = (endH * 60 + endM) - (startH * 60 + startM);
        updatedTask.timeSpent = diff < 0 ? diff + 1440 : diff;
      } else if (!end) {
        updatedTask.timeSpent = '';
      }
    }

    newTasks[index] = updatedTask;
    setTasks(newTasks);
  };

  const clearAll = () => {
    if (window.confirm("Are you sure you want to clear all 100 tasks?")) {
      setTasks(Array(100).fill({
        jobTitle: '', startTime: '', endTime: '',
        taskID: '', answer: '', timeSpent: ''
      }));
    }
  };

  const handleSubmit = async () => {
  if (!globalData.agentName || !globalData.date) {
    alert("Please select an Agent Name and Date first.");
    return;
  }

  // 1. Properly map "Master" data to every single row in the batch
  const finalData = tasks
    .map((t, index) => {
      // Find the "Master" row for this set of 10
      const masterIndex = Math.floor(index / 10) * 10;
      const master = tasks[masterIndex];
      
      return {
        agentName: globalData.agentName,
        date: globalData.date,
        projectNo: Math.floor(index / 10) + 1,
        taskNo: (index % 10) + 1,
        // CRITICAL: Use the master's values if the current row is empty
        jobTitle: master.jobTitle,
        startTime: master.startTime,
        endTime: master.endTime,
        timeSpent: master.timeSpent,
        // Individual row values
        taskID: t.taskID,
        answer: t.answer
      };
    })
    // 2. ONLY filter out rows that have NO Task ID AND NO Answer
    // This ensures all 10 rows of a set are sent if they have data
    .filter(t => t.taskID.trim() !== "" || t.answer !== "");

  if (finalData.length === 0) {
    alert("There is no data to submit. Please fill in Task IDs or Answers.");
    return;
  }

  setIsSubmitting(true);

  try {
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzz-LyLUrN5nm8Ow-bNYpvgnIlNkKvShjslLbcIwSObmjkGWutZYhvLixuO1p0aiUTh5A/exec";

    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(finalData),
    });

    alert(`Success! ${finalData.length} tasks uploaded to Google Sheets.`);
    // clearAll(); // Uncomment to reset the board after success
  } catch (error) {
    console.error("Submission error:", error);
    alert("Submission failed. Check connection.");
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="container">
      <div className="header-section">
        <h2>Efficiency Tracker</h2>
        <div className="global-inputs">
          <select value={globalData.agentName} onChange={(e) => handleGlobalChange('agentName', e.target.value)}>
            <option value="">Select Agent...</option>
            {AGENTS.map(name => <option key={name} value={name}>{name}</option>)}
          </select>
          <input type="date" onChange={(e) => handleGlobalChange('date', e.target.value)} />
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Project No.</th>
              <th>Task No.</th>
              <th>Job Title</th>
              <th>Task ID</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Time (Min)</th>
              <th>Answer</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, index) => {
              const projectNum = Math.floor(index / 10) + 1;
              const taskNum = (index % 10) + 1;
              const isFirstInSet = taskNum === 1;
              const masterIndex = Math.floor(index / 10) * 10;
              const masterTask = tasks[masterIndex];

              return (
                <tr key={index} className={isFirstInSet ? "row-divider" : ""}>
                  <td className="auto-field">{projectNum}</td>
                  <td className="auto-field">{taskNum}</td>
                  
                  <td>
                    <select 
                      value={isFirstInSet ? task.jobTitle : masterTask.jobTitle} 
                      disabled={!isFirstInSet}
                      onChange={(e) => handleTaskChange(index, 'jobTitle', e.target.value)}
                      className={!isFirstInSet ? "inherited-field" : ""}
                    >
                      <option value="">Select Job...</option>
                      {JOBS.map(job => <option key={job} value={job}>{job}</option>)}
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
                      value={isFirstInSet ? task.startTime : masterTask.startTime}
                      disabled={!isFirstInSet}
                      onChange={(e) => handleTaskChange(index, 'startTime', e.target.value)}
                      className={!isFirstInSet ? "inherited-field" : ""}
                    />
                  </td>
                  <td>
                    <input
                      type="time"
                      value={isFirstInSet ? task.endTime : masterTask.endTime}
                      disabled={!isFirstInSet}
                      onChange={(e) => handleTaskChange(index, 'endTime', e.target.value)}
                      className={!isFirstInSet ? "inherited-field" : ""}
                    />
                  </td>
                  <td className="auto-field">
                    {masterTask.timeSpent !== '' ? masterTask.timeSpent : '-'}
                  </td>
                  
                  <td>
                    <select 
                      value={task.answer} 
                      onChange={(e) => handleTaskChange(index, 'answer', e.target.value)}
                    >
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
        <button className="clear-btn" onClick={clearAll} disabled={isSubmitting}>
          Clear Board
        </button>
        <button 
          className="submit-btn" 
          onClick={handleSubmit} 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Uploading..." : "Submit All 100 Tasks"}
        </button>
      </div>
    </div>
  )
}

export default App