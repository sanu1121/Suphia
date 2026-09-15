import React, { useState } from 'react';
import { ReminderItem, NoteItem, PersonalityMode } from '../types';
import { PERSONALITIES } from '../data/personalities';
import { Bell, FileText, Plus, X, Trash2, Clock } from 'lucide-react';

interface RemindersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  reminders: ReminderItem[];
  notes: NoteItem[];
  mode: PersonalityMode;
  onAddReminder: (title: string, timeStr: string) => void;
  onDeleteReminder: (id: string) => void;
  onAddNote: (title: string, content: string) => void;
  onDeleteNote: (id: string) => void;
}

export const RemindersDrawer: React.FC<RemindersDrawerProps> = ({
  isOpen,
  onClose,
  reminders,
  notes,
  mode,
  onAddReminder,
  onDeleteReminder,
  onAddNote,
  onDeleteNote,
}) => {
  const [activeTab, setActiveTab] = useState<'reminders' | 'notes'>('reminders');
  const [remTitle, setRemTitle] = useState('');
  const [remTime, setRemTime] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  if (!isOpen) return null;

  const personality = PERSONALITIES[mode] || PERSONALITIES.girlfriend;

  const handleReminderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remTitle.trim()) return;
    onAddReminder(remTitle.trim(), remTime.trim() || 'in 15 mins');
    setRemTitle('');
    setRemTime('');
  };

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;
    onAddNote(noteTitle.trim(), noteContent.trim());
    setNoteTitle('');
    setNoteContent('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        id="sophia-reminders-modal"
        className="w-full max-w-lg bg-[#050505]/90 border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden backdrop-blur-2xl"
        style={{
          boxShadow: `0 0 50px ${personality.glowColor}`,
        }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('reminders')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'reminders'
                  ? 'bg-white/[0.1] text-white border border-white/20 shadow-md'
                  : 'text-white/45 hover:text-white'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              Reminders ({reminders.length})
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'notes'
                  ? 'bg-white/[0.1] text-white border border-white/20 shadow-md'
                  : 'text-white/45 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Quick Notes ({notes.length})
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {activeTab === 'reminders' ? (
            <div>
              {/* Add Reminder Form */}
              <form onSubmit={handleReminderSubmit} className="space-y-2.5 mb-4">
                <input
                  type="text"
                  placeholder="Reminder title (e.g., Standup call)..."
                  value={remTitle}
                  onChange={(e) => setRemTitle(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Time (e.g., 5:00 PM or in 30 mins)..."
                    value={remTime}
                    onChange={(e) => setRemTime(e.target.value)}
                    className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white transition-all flex items-center gap-1 cursor-pointer shadow-lg hover:brightness-110"
                    style={{ backgroundColor: personality.themeColor }}
                  >
                    <Plus className="w-3.5 h-3.5" /> Set
                  </button>
                </div>
              </form>

              {/* Reminders List */}
              <div className="space-y-2">
                {reminders.length === 0 ? (
                  <p className="text-center py-6 text-xs text-white/40 italic font-light">
                    No active reminders. Ask Sophia to set one!
                  </p>
                ) : (
                  reminders.map((rem) => (
                    <div
                      key={rem.id}
                      className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between hover:border-white/15 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Clock className="w-4 h-4 text-pink-400" />
                        <div>
                          <div className="text-xs font-medium text-white">{rem.title}</div>
                          <div className="text-[10px] text-white/45 font-mono">{rem.timeStr}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => onDeleteReminder(rem.id)}
                        className="text-white/30 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div>
              {/* Add Note Form */}
              <form onSubmit={handleNoteSubmit} className="space-y-2.5 mb-4">
                <input
                  type="text"
                  placeholder="Note Title..."
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30"
                />
                <textarea
                  placeholder="Note Content..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  rows={2}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30 resize-none"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl text-xs font-semibold text-white transition-all flex items-center justify-center gap-1 cursor-pointer shadow-lg hover:brightness-110"
                  style={{ backgroundColor: personality.themeColor }}
                >
                  <Plus className="w-3.5 h-3.5" /> Save Note
                </button>
              </form>

              {/* Notes List */}
              <div className="space-y-2">
                {notes.length === 0 ? (
                  <p className="text-center py-6 text-xs text-white/40 italic font-light">
                    No notes stored.
                  </p>
                ) : (
                  notes.map((note) => (
                    <div
                      key={note.id}
                      className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex flex-col gap-1.5 hover:border-white/15 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white tracking-wide">{note.title}</span>
                        <button
                          onClick={() => onDeleteNote(note.id)}
                          className="text-white/30 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-white/70 whitespace-pre-wrap font-light">{note.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
