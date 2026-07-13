import { useState, useMemo, useEffect, useCallback } from 'react';
import { cn } from '../utils/cn';
import { submitToGoogleSheet } from '../utils/submitToSheet';
import { saveSession, loadSession, clearSession, SESSION_KEYS } from '../utils/sessions';
import {
  LogOutIcon, ClipboardIcon, ClockIcon, PlusIcon,
  ChevronDownIcon, ChevronUpIcon, TrashIcon, CheckIcon, XIcon,
  BarChartIcon, HashIcon, AlertIcon, RefreshIcon, ShopeeLogo, SendIcon,
} from './Icons';

// ─── Constants ───────────────────────────────────────────────────────────────

const TASK_NAMES = [
  'Inherit Traffic Daily QC',
  'Bidding - Seller Appeal',
  'Inherit Traffic High Imp',
  'Bidding Winner Pool QC',
] as const;

const ITEMS_PER_TASK = 10;
const MAX_TASKS = 11;

// ─── Types ───────────────────────────────────────────────────────────────────

interface TaskItem {
  taskId: string;
  answer: 'yes' | 'no' | '';
}

interface Task {
  id: number;
  taskName: string;
  startTime: string;
  endTime: string;
  items: TaskItem[];
}

interface UserInfo {
  email: string;
  name: string;
  avatar: string;
  photo: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function createEmptyTask(id: number): Task {
  return {
    id,
    taskName: '',
    startTime: '',
    endTime: '',
    items: Array.from({ length: ITEMS_PER_TASK }, () => ({ taskId: '', answer: '' as const })),
  };
}

function parseTimeToMinutes(time: string): number | null {
  if (!time) return null;
  const [h, m] = time.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

function addMinutesToTime(time: string, minutesToAdd: number): string {
  const totalMinutes = parseTimeToMinutes(time);
  if (totalMinutes === null) return '';
  let newTotal = totalMinutes + minutesToAdd;
  if (newTotal >= 24 * 60) newTotal -= 24 * 60;
  const h = Math.floor(newTotal / 60);
  const m = newTotal % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// ─── Task Card ───────────────────────────────────────────────────────────────

interface TaskCardProps {
  task: Task;
  index: number;
  onUpdate: (task: Task) => void;
  onRemove: () => void;
  canRemove: boolean;
}

const TaskCard = ({ task, index, onUpdate, onRemove, canRemove }: TaskCardProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const taskDuration = useMemo(() => {
    const start = parseTimeToMinutes(task.startTime);
    const end = parseTimeToMinutes(task.endTime);
    if (start === null || end === null) return null;
    let diff = end - start;
    if (diff < 0) diff += 24 * 60;
    return diff;
  }, [task.startTime, task.endTime]);

  const filledItems = task.items.filter((i) => i.taskId.trim() !== '').length;
  const answeredItems = task.items.filter((i) => i.answer !== '').length;
  const yesCount = task.items.filter((i) => i.answer === 'yes').length;
  const noCount = task.items.filter((i) => i.answer === 'no').length;

  const isComplete = task.taskName !== '' && task.startTime !== '' && task.endTime !== '' && filledItems === ITEMS_PER_TASK && answeredItems === ITEMS_PER_TASK;

  const updateItem = (itemIndex: number, field: keyof TaskItem, value: string) => {
    const newItems = [...task.items];
    newItems[itemIndex] = { ...newItems[itemIndex], [field]: value };
    onUpdate({ ...task, items: newItems });
  };

  const taskColor = useMemo(() => {
    const colors: Record<string, { bg: string; border: string; text: string; badge: string; dot: string }> = {
      'Inherit Traffic Daily QC': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
      'Bidding - Seller Appeal': { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', badge: 'bg-violet-100 text-violet-700', dot: 'bg-violet-500' },
      'Inherit Traffic High Imp': { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
      'Bidding Winner Pool QC': { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
    };
    return colors[task.taskName] || { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', badge: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' };
  }, [task.taskName]);

  return (
    <div className={cn(
      'rounded-xl border bg-white shadow-sm transition-all duration-300 hover:shadow-md',
      isComplete ? 'border-emerald-200 ring-1 ring-emerald-100' : 'border-slate-200'
    )}>
      {/* Task Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0',
          isComplete ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
        )}>
          {isComplete ? <CheckIcon className="text-emerald-600" /> : index + 1}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-800 truncate">
              Task {index + 1}
            </h3>
            {task.taskName && (
              <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full flex-shrink-0', taskColor.badge)}>
                {task.taskName}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-slate-400">{filledItems}/{ITEMS_PER_TASK} items</span>
            {taskDuration !== null && (
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <ClockIcon className="w-3 h-3" /> {formatDuration(taskDuration)}
              </span>
            )}
            {answeredItems > 0 && (
              <span className="text-xs text-slate-400">
                ✓ {yesCount} · ✗ {noCount}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {canRemove && (
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
              title="Remove task"
            >
              <TrashIcon />
            </button>
          )}
          {isExpanded ? (
            <ChevronUpIcon className="text-slate-400" />
          ) : (
            <ChevronDownIcon className="text-slate-400" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      <div className={cn(
        'overflow-hidden transition-all duration-300',
        isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
      )}>
        <div className="border-t border-slate-100 px-4 py-4 space-y-4">
          {/* Task Name + Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Task Name Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Task Name
              </label>
              <div className="relative">
                <select
                  value={task.taskName}
                  onChange={(e) => onUpdate({ ...task, taskName: e.target.value })}
                  className={cn(
                    'w-full appearance-none rounded-lg border px-3 py-2.5 text-sm font-medium outline-none transition-all cursor-pointer',
                    'focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300',
                    task.taskName
                      ? cn(taskColor.bg, taskColor.border, taskColor.text)
                      : 'bg-white border-slate-200 text-slate-400'
                  )}
                >
                  <option value="">Select task...</option>
                  {TASK_NAMES.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Start Time
              </label>
              <input
                type="time"
                value={task.startTime}
                onChange={(e) => {
                  const newStart = e.target.value;
                  const autoEnd = addMinutesToTime(newStart, 25);
                  onUpdate({ ...task, startTime: newStart, endTime: autoEnd });
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
              />
            </div>

            {/* End Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                End Time
              </label>
              <input
                type="time"
                value={task.endTime}
                onChange={(e) => onUpdate({ ...task, endTime: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
              />
            </div>
          </div>

          {/* Duration badge */}
          {taskDuration !== null && (
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-medium text-indigo-600">
                <ClockIcon className="w-3 h-3" />
                Duration: {formatDuration(taskDuration)}
              </div>
            </div>
          )}

          {/* Items Table */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Task Items ({filledItems}/{ITEMS_PER_TASK} filled)
            </label>
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-[40px_1fr_120px] bg-slate-50 border-b border-slate-200 px-3 py-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">#</span>
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Task ID</span>
                <span className="text-[11px] font-semibold text-slate-400 uppercase text-center">Answer</span>
              </div>

              {/* Table Rows */}
              {task.items.map((item, i) => (
                <div
                  key={i}
                  className={cn(
                    'grid grid-cols-[40px_1fr_120px] items-center px-3 py-1.5 transition-colors',
                    i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50',
                    i < task.items.length - 1 && 'border-b border-slate-100'
                  )}
                >
                  {/* Row number */}
                  <span className="text-xs text-slate-400 font-mono">{i + 1}</span>

                  {/* Task ID input */}
                  <div className="pr-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={item.taskId}
                      onChange={(e) => updateItem(i, 'taskId', e.target.value.replace(/\D/g, ''))}
                      onPaste={(e) => {
                        e.preventDefault();
                        const pasted = e.clipboardData.getData('text').replace(/\D/g, '');
                        updateItem(i, 'taskId', pasted);
                      }}
                      placeholder="Enter task ID..."
                      className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-700 outline-none placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
                    />
                  </div>

                  {/* Yes / No buttons */}
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => updateItem(i, 'answer', item.answer === 'yes' ? '' : 'yes')}
                      className={cn(
                        'flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all',
                        item.answer === 'yes'
                          ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 shadow-sm'
                          : 'bg-white border border-slate-200 text-slate-400 hover:border-emerald-300 hover:text-emerald-500'
                      )}
                    >
                      <CheckIcon className="w-3 h-3" />
                      Yes
                    </button>
                    <button
                      onClick={() => updateItem(i, 'answer', item.answer === 'no' ? '' : 'no')}
                      className={cn(
                        'flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all',
                        item.answer === 'no'
                          ? 'bg-red-100 text-red-700 ring-1 ring-red-200 shadow-sm'
                          : 'bg-white border border-slate-200 text-slate-400 hover:border-red-300 hover:text-red-500'
                      )}
                    >
                      <XIcon className="w-3 h-3" />
                      No
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Summary Panel ───────────────────────────────────────────────────────────

interface SummaryPanelProps {
  tasks: Task[];
  isFullyComplete: boolean;
  submitState: 'idle' | 'submitting' | 'submitted' | 'error';
  submitMessage: string;
  onSubmit: () => void;
  onNewBatch: () => void;
}

const SummaryPanel = ({ tasks, isFullyComplete, submitState, submitMessage, onSubmit, onNewBatch }: SummaryPanelProps) => {
  const stats = useMemo(() => {
    let totalMinutes = 0;
    let completedTasks = 0;
    let totalItemsFilled = 0;
    let totalYes = 0;
    let totalNo = 0;
    let totalAnswered = 0;
    const taskBreakdown: { name: string; duration: number; items: number; yes: number; no: number }[] = [];

    for (let idx = 0; idx < tasks.length; idx++) {
      const task = tasks[idx];
      const hasName = task.taskName !== '';

      const start = parseTimeToMinutes(task.startTime);
      const end = parseTimeToMinutes(task.endTime);
      let duration = 0;
      if (start !== null && end !== null) {
        duration = end - start;
        if (duration < 0) duration += 24 * 60;
        totalMinutes += duration;
      }

      const filled = task.items.filter((i) => i.taskId.trim() !== '').length;
      const yes = task.items.filter((i) => i.answer === 'yes').length;
      const no = task.items.filter((i) => i.answer === 'no').length;
      const answered = task.items.filter((i) => i.answer !== '').length;

      totalItemsFilled += filled;
      totalYes += yes;
      totalNo += no;
      totalAnswered += answered;

      const isComplete = hasName && task.startTime !== '' && task.endTime !== '' && filled === ITEMS_PER_TASK && answered === ITEMS_PER_TASK;
      if (isComplete) completedTasks++;

      taskBreakdown.push({
        name: hasName ? task.taskName : `Task ${idx + 1} (unnamed)`,
        duration,
        items: filled,
        yes,
        no,
      });
    }

    return { totalMinutes, completedTasks, totalItemsFilled, totalYes, totalNo, totalAnswered, taskBreakdown };
  }, [tasks]);

  const totalTasks = tasks.length;

  return (
    <div className="space-y-5">
      {/* Main Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 p-4 text-white shadow-lg shadow-indigo-200/50">
          <div className="flex items-center gap-2 mb-2">
            <ClockIcon className="w-4 h-4 opacity-80" />
            <span className="text-xs font-medium opacity-80 uppercase tracking-wider">Total Time</span>
          </div>
          <div className="text-2xl font-bold">{formatDuration(stats.totalMinutes)}</div>
          <div className="text-xs opacity-70 mt-1">{stats.totalMinutes} minutes total</div>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-4 text-white shadow-lg shadow-emerald-200/50">
          <div className="flex items-center gap-2 mb-2">
            <ClipboardIcon className="w-4 h-4 opacity-80" />
            <span className="text-xs font-medium opacity-80 uppercase tracking-wider">Tasks</span>
          </div>
          <div className="text-2xl font-bold">{stats.completedTasks}/{totalTasks}</div>
          <div className="text-xs opacity-70 mt-1">completed tasks</div>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 p-4 text-white shadow-lg shadow-amber-200/50">
          <div className="flex items-center gap-2 mb-2">
            <HashIcon className="w-4 h-4 opacity-80" />
            <span className="text-xs font-medium opacity-80 uppercase tracking-wider">Items</span>
          </div>
          <div className="text-2xl font-bold">{stats.totalItemsFilled}</div>
          <div className="text-xs opacity-70 mt-1">of {totalTasks * ITEMS_PER_TASK} items filled</div>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 p-4 text-white shadow-lg shadow-sky-200/50">
          <div className="flex items-center gap-2 mb-2">
            <BarChartIcon className="w-4 h-4 opacity-80" />
            <span className="text-xs font-medium opacity-80 uppercase tracking-wider">Answers</span>
          </div>
          <div className="text-2xl font-bold">{stats.totalYes} / {stats.totalNo}</div>
          <div className="text-xs opacity-70 mt-1">yes / no ({stats.totalAnswered} answered)</div>
        </div>
      </div>

      {/* Per-Task Breakdown */}
      {stats.taskBreakdown.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
            <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <BarChartIcon className="w-4 h-4 text-slate-400" />
              Task Breakdown
            </h4>
          </div>
          <div className="divide-y divide-slate-100">
            {stats.taskBreakdown.map((tb, i) => {
              const colorMap: Record<string, string> = {
                'Inherit Traffic Daily QC': 'bg-blue-500',
                'Bidding - Seller Appeal': 'bg-violet-500',
                'Inherit Traffic High Imp': 'bg-amber-500',
                'Bidding Winner Pool QC': 'bg-emerald-500',
              };
              const barColor = colorMap[tb.name] || 'bg-slate-400';
              const maxDuration = Math.max(...stats.taskBreakdown.map((t) => t.duration), 1);
              const barWidth = (tb.duration / maxDuration) * 100;

              return (
                <div key={i} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-400">#{i + 1}</span>
                      <span className="text-sm font-medium text-slate-700">{tb.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-700">
                      {tb.duration > 0 ? formatDuration(tb.duration) : '—'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all duration-500', barColor)}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-shrink-0">
                      <span className="flex items-center gap-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        {tb.yes}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                        {tb.no}
                      </span>
                      <span className="text-slate-400">({tb.items} items)</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Submit Button — only when ALL 10 tasks are 100% complete ─── */}
      {isFullyComplete && (
        <div className={cn(
          'rounded-xl p-6 animate-fade-in-up',
          submitState === 'error'
            ? 'border border-red-200 bg-gradient-to-br from-red-50 to-orange-50/50'
            : 'border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50/50'
        )}>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 text-center sm:text-left">
              {submitState === 'submitted' ? (
                <>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                    <CheckIcon className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-sm font-bold text-emerald-800">Submitted Successfully!</h4>
                  </div>
                  <p className="text-xs text-emerald-600/80">{submitMessage}</p>
                </>
              ) : submitState === 'error' ? (
                <>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                    <AlertIcon className="w-4 h-4 text-red-500" />
                    <h4 className="text-sm font-bold text-red-800">Submission Failed</h4>
                  </div>
                  <p className="text-xs text-red-600/80">{submitMessage}</p>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                    <CheckIcon className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-sm font-bold text-emerald-800">All Tasks Complete</h4>
                  </div>
                  <p className="text-xs text-emerald-600/80">
                    All {MAX_TASKS} tasks with {MAX_TASKS * ITEMS_PER_TASK} items are filled and ready to submit.
                  </p>
                </>
              )}
            </div>
            {submitState === 'submitted' ? (
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-100 border border-emerald-200 text-sm font-semibold text-emerald-700">
                  <CheckIcon className="w-4 h-4" />
                  Done
                </div>
                <button
                  onClick={onNewBatch}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-bold shadow-lg shadow-indigo-200/50 hover:from-indigo-600 hover:to-violet-700 hover:shadow-xl active:scale-[0.97] transition-all"
                >
                  <PlusIcon className="w-4 h-4" />
                  Submit New Batch
                </button>
              </div>
            ) : (
              <button
                onClick={onSubmit}
                disabled={submitState === 'submitting'}
                className={cn(
                  'flex items-center gap-2.5 px-7 py-3 rounded-xl text-sm font-bold shadow-lg active:scale-[0.97] transition-all',
                  submitState === 'submitting'
                    ? 'bg-slate-400 text-white cursor-not-allowed shadow-slate-200/50'
                    : submitState === 'error'
                      ? 'bg-gradient-to-r from-red-500 to-orange-600 text-white shadow-red-200/50 hover:from-red-600 hover:to-orange-700 hover:shadow-xl'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-200/50 hover:from-emerald-600 hover:to-teal-700 hover:shadow-xl'
                )}
              >
                {submitState === 'submitting' ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting to Google Sheet...
                  </>
                ) : submitState === 'error' ? (
                  <>
                    <RefreshIcon className="w-4 h-4" />
                    Retry Submission
                  </>
                ) : (
                  <>
                    <SendIcon className="w-4 h-4" />
                    Submit All Tasks
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main TaskTracker Component ──────────────────────────────────────────────

interface TaskTrackerProps {
  user: UserInfo;
  onLogout: () => void;
}

export default function TaskTracker({ user, onLogout }: TaskTrackerProps) {
  // Restore saved state from session
  const savedTasks = loadSession<Task[]>(SESSION_KEYS.TASKS);
  const savedTab = loadSession<boolean>(SESSION_KEYS.TAB);

  const [tasks, setTasks] = useState<Task[]>(savedTasks && savedTasks.length > 0 ? savedTasks : [createEmptyTask(1)]);
  const [showSummary, setShowSummary] = useState(savedTab ?? false);
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'submitted' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  // Persist tasks whenever they change
  const persistTasks = useCallback((newTasks: Task[]) => {
    setTasks(newTasks);
    saveSession(SESSION_KEYS.TASKS, newTasks);
  }, []);

  // Persist tab whenever it changes
  useEffect(() => {
    saveSession(SESSION_KEYS.TAB, showSummary);
  }, [showSummary]);

  const addTask = () => {
    if (tasks.length >= MAX_TASKS) return;
    persistTasks([...tasks, createEmptyTask(tasks.length + 1)]);
  };

  const removeTask = (index: number) => {
    if (tasks.length <= 1) return;
    const newTasks = tasks.filter((_, i) => i !== index).map((t, i) => ({ ...t, id: i + 1 }));
    persistTasks(newTasks);
  };

  const updateTask = (index: number, updatedTask: Task) => {
    const newTasks = [...tasks];
    newTasks[index] = updatedTask;
    persistTasks(newTasks);
  };

  const resetAll = () => {
    persistTasks([createEmptyTask(1)]);
    setShowSummary(false);
    setSubmitState('idle');
    setSubmitMessage('');
    clearSession(SESSION_KEYS.TASKS);
    clearSession(SESSION_KEYS.TAB);
  };

  const handleNewBatch = () => {
    persistTasks([createEmptyTask(1)]);
    setShowSummary(false);
    setSubmitState('idle');
    setSubmitMessage('');
  };

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const activeTasks = tasks.filter((t) => t.taskName !== '');
  const allComplete = activeTasks.length > 0 && activeTasks.every(
    (t) => t.startTime && t.endTime && t.items.every((i) => i.taskId.trim() && i.answer !== '')
  );

  // Fully complete = exactly 10 tasks, each with name, times, and all 10 items filled + answered
  const isFullyComplete = tasks.length === MAX_TASKS && tasks.every(
    (t) => t.taskName !== '' && t.startTime !== '' && t.endTime !== '' &&
      t.items.every((i) => i.taskId.trim() !== '' && i.answer !== '')
  );

  const handleSubmit = async () => {
    if (!isFullyComplete || (submitState !== 'idle' && submitState !== 'error')) return;
    setSubmitState('submitting');
    setSubmitMessage('');

    try {
      const agentName = user.name;
      const result = await submitToGoogleSheet(agentName, tasks);

      if (result.success) {
        setSubmitState('submitted');
        setSubmitMessage(result.message);
      } else {
        setSubmitState('error');
        setSubmitMessage(result.message);
      }
    } catch {
      setSubmitState('error');
      setSubmitMessage('An unexpected error occurred. Please try again.');
    }
  };

  const totalItems = tasks.reduce((acc, t) => acc + t.items.filter((i) => i.taskId.trim()).length, 0);
  const totalAnswered = tasks.reduce((acc, t) => acc + t.items.filter((i) => i.answer !== '').length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 zebra-bg">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-30 glass border-b border-slate-200/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-shopee to-orange-500 flex items-center justify-center shadow-md shadow-orange-200/50">
              <ShopeeLogo className="text-white" size={18} />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-slate-800 text-sm tracking-tight">Shopee VKAM</span>
              <span className="text-xs text-slate-400 ml-1.5">CMI Bidding Tracker</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:flex items-center gap-3 mr-2 text-xs text-slate-500">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100">
                <ClipboardIcon className="w-3.5 h-3.5" />
                {tasks.length}/{MAX_TASKS} tasks
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100">
                <HashIcon className="w-3 h-3" />
                {totalItems} items
              </span>
            </div>
            <div className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-sm">
              {user.photo ? (
                <img
                  src={user.photo}
                  alt={user.name}
                  className="w-7 h-7 rounded-lg object-cover shadow-sm"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm', user.avatar)}>
                  {user.name[0]}
                </div>
              )}
              <span className="text-sm font-medium text-slate-700 hidden sm:block">{user.name}</span>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <LogOutIcon />
              <span className="hidden sm:block">Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Task Tracker
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Record up to {MAX_TASKS} tasks with {ITEMS_PER_TASK} items each. Log task IDs, answers, and time spent.
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-sm flex-shrink-0">
              <ClockIcon className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-medium text-slate-700">{todayFormatted}</span>
            </div>
          </div>
        </div>

        {/* Tab toggle */}
        <div className="flex items-center gap-2 mb-6 p-1 bg-slate-100 rounded-xl w-fit">
          <button
            onClick={() => setShowSummary(false)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              !showSummary
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            <ClipboardIcon className="w-4 h-4" />
            Tasks
          </button>
          <button
            onClick={() => setShowSummary(true)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              showSummary
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            <BarChartIcon className="w-4 h-4" />
            Summary
          </button>
        </div>

        {showSummary ? (
          <div className="animate-fade-in-up">
            {activeTasks.length === 0 ? (
              <div className="text-center py-16 rounded-xl border-2 border-dashed border-slate-200">
                <AlertIcon className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-400 text-sm font-medium">No tasks recorded yet</p>
                <p className="text-slate-400 text-xs mt-1">Go to Tasks tab and start recording</p>
              </div>
            ) : (
              <SummaryPanel tasks={tasks} isFullyComplete={isFullyComplete} submitState={submitState} submitMessage={submitMessage} onSubmit={handleSubmit} onNewBatch={handleNewBatch} />
            )}
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in-up">
            {/* Progress bar */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Overall Progress
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {totalAnswered} / {totalItems || activeTasks.length * ITEMS_PER_TASK} answers recorded
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    allComplete
                      ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                      : 'bg-gradient-to-r from-indigo-400 to-violet-500'
                  )}
                  style={{
                    width: `${((totalAnswered / Math.max(totalItems || activeTasks.length * ITEMS_PER_TASK, 1)) * 100)}%`
                  }}
                />
              </div>
              {allComplete && activeTasks.length > 0 && (
                <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                  <CheckIcon className="w-3.5 h-3.5" />
                  All active tasks completed! Check the Summary tab for your report.
                </div>
              )}
            </div>

            {/* Task Cards */}
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onUpdate={(updated) => updateTask(index, updated)}
                onRemove={() => removeTask(index)}
                canRemove={tasks.length > 1}
              />
            ))}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              {tasks.length < MAX_TASKS && (
                <button
                  onClick={addTask}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border-2 border-dashed border-slate-300 text-sm font-semibold text-slate-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 active:scale-[0.98] transition-all"
                >
                  <PlusIcon />
                  Add Task {tasks.length + 1} of {MAX_TASKS}
                </button>
              )}
              {tasks.length >= MAX_TASKS && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-700">
                  <AlertIcon className="w-4 h-4 flex-shrink-0" />
                  Maximum of {MAX_TASKS} tasks reached
                </div>
              )}

              <button
                onClick={resetAll}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600 active:scale-[0.98] transition-all sm:ml-auto"
              >
                <RefreshIcon />
                Reset All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 bg-white/50 mt-8">
        <div className="max-w-6xl mx-auto px-6 py-5 text-center text-xs text-slate-400">
          Shopee VKAM Back Office · CMI Bidding Task Tracker · {user.email}
        </div>
      </footer>
    </div>
  );
}