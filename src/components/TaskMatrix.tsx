import React, { useState } from 'react';
import { TaskItem } from '../types';
import { CheckCircle2, Circle, Plus, Trash2, CheckSquare } from 'lucide-react';

interface TaskMatrixProps {
  tasks: TaskItem[];
  onAddTask: (text: string, priority: 'low' | 'medium' | 'high') => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

export const TaskMatrix: React.FC<TaskMatrixProps> = ({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
}) => {
  const [newTaskText, setNewTaskText] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    onAddTask(newTaskText.trim(), priority);
    setNewTaskText('');
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.length - completedCount;

  return (
    <div
      id="sophia-task-matrix"
      className="w-full immersive-widget p-4 sm:p-5 flex flex-col h-full shadow-2xl"
    >
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-pink-500" />
          <h3 className="immersive-label">
            Active Memory & Tasks
          </h3>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono tracking-wider">
          <span className="text-emerald-400">{completedCount} DONE</span>
          <span className="text-white/20">•</span>
          <span className="text-pink-400">{pendingCount} PENDING</span>
        </div>
      </div>

      {/* Task input form */}
      <form onSubmit={handleSubmit} className="mt-3.5 flex gap-2">
        <input
          type="text"
          id="input-task-text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          placeholder="Add task or speak to Sophia..."
          className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as any)}
          className="bg-black/60 border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white/70 focus:outline-none"
        >
          <option value="low">Low</option>
          <option value="medium">Med</option>
          <option value="high">High</option>
        </select>
        <button
          type="submit"
          id="btn-add-task"
          className="px-3.5 py-2 bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add</span>
        </button>
      </form>

      {/* Task List */}
      <div className="mt-3.5 flex-1 overflow-y-auto space-y-2 max-h-56 pr-1">
        {tasks.length === 0 ? (
          <div className="text-center py-6 text-xs text-white/40 italic font-light">
            No active memory. Say &quot;Sophia, add a task...&quot; or create one above!
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              id={`task-item-${task.id}`}
              className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 transition-all ${
                task.completed
                  ? 'bg-white/[0.01] border-white/[0.04] text-white/30'
                  : 'bg-white/[0.03] border-white/[0.07] text-white hover:border-white/20'
              }`}
            >
              <button
                type="button"
                onClick={() => onToggleTask(task.id)}
                className="flex items-center gap-2.5 text-left flex-1 cursor-pointer"
              >
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${task.completed ? 'bg-white/20' : 'bg-pink-500'}`} />
                <span
                  className={`text-xs font-light tracking-wide ${
                    task.completed ? 'line-through text-white/35' : 'text-white/90'
                  }`}
                >
                  {task.text}
                </span>
              </button>

              <div className="flex items-center gap-2">
                <span
                  className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded-full border ${
                    task.priority === 'high'
                      ? 'border-pink-500/40 text-pink-400 bg-pink-500/10'
                      : task.priority === 'medium'
                      ? 'border-amber-500/40 text-amber-400 bg-amber-500/10'
                      : 'border-white/10 text-white/40 bg-white/[0.02]'
                  }`}
                >
                  {task.priority}
                </span>

                <button
                  type="button"
                  id={`btn-del-task-${task.id}`}
                  onClick={() => onDeleteTask(task.id)}
                  className="text-white/30 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                  title="Remove Task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
