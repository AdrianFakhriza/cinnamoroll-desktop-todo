import { useState, useEffect } from 'react';
import { useTasks } from './useTasks';
import { 
  Cloud, 
  Minus, 
  X, 
  Trash2, 
  Repeat, 
  Check,
  Bell,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import HeaderImg from '../assets/Header.jpeg';
import IconImg from '../assets/Icon.jpeg';

export default function App() {
  const { tasks, addTask, toggleTask, toggleRepeatable, setReminder, deleteTask } = useTasks();
  const [isMinimized, setIsMinimized] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Request Notification permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
    
    // Listen for custom toast events
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent;
      setToastMessage(customEvent.detail);
      // Auto-hide after 5 seconds
      setTimeout(() => setToastMessage(null), 5000);
    };
    
    window.addEventListener('show-toast', handleToast);
    return () => window.removeEventListener('show-toast', handleToast);
  }, []);

  // Check URL params for widget mode (For Electron dual-window setup)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'widget') {
      setIsMinimized(true);
    }
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    addTask(newTaskText, false);
    setNewTaskText('');
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    try {
      // @ts-ignore
      if (window.electron) {
        // @ts-ignore
        window.electron.send('minimize-to-widget');
      }
    } catch (e) {
      console.log("Not running in Electron environment");
    }
  };

  const handleRestore = () => {
    setIsMinimized(false);
    try {
      // @ts-ignore
      if (window.electron) {
        // @ts-ignore
        window.electron.send('restore-from-widget');
      }
    } catch (e) {
      console.log("Not running in Electron environment");
    }
  };

  const handleClose = () => {
    try {
      // @ts-ignore
      if (window.electron) window.electron.send('close-app');
    } catch (e) {
      console.log("Not running in Electron environment");
    }
  };

  // If minimized, show the floating icon widget
  if (isMinimized) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-transparent pointer-events-none">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="relative flex items-center justify-center pointer-events-auto"
        >
          {/* Main draggable widget */}
          <div 
            className="w-[72px] h-[72px] bg-white rounded-full shadow-xl flex items-center justify-center border-4 border-[#B9E0F7] hover:scale-105 transition-transform drag-region overflow-hidden group"
            title="Drag to move"
          >
             <img src={IconImg} alt="Cinnamoroll Icon" className="w-full h-full object-cover pointer-events-none" onError={(e) => { e.currentTarget.src = "https://api.dicebear.com/9.x/shapes/svg?seed=cinna&backgroundColor=E0F2FE" }} />
          </div>
          
          {/* Badge */}
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-[#FBCFE8] border-2 border-white text-[#D982B5] text-[10px] font-bold rounded-full shadow-sm flex items-center justify-center px-1 pointer-events-none">
            {tasks.filter(t => !t.completed).length}
          </span>

          {/* Restore Button - no drag */}
          <button 
            onClick={handleRestore}
            className="absolute -bottom-2 no-drag bg-[#B9E0F7] text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md hover:bg-[#8AC6EE] hover:scale-110 transition-all cursor-pointer border-2 border-white"
          >
            Open
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-transparent pointer-events-none">
      {/* Frameless App Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-[420px] h-[600px] bg-[#F0F8FF] rounded-[48px] shadow-2xl overflow-hidden flex flex-col relative border-8 border-white pointer-events-auto"
      >
        {/* Title Bar (Drag Region) */}
        <div className="h-14 flex items-center justify-between px-6 pt-4 drag-region z-10">
          <div className="flex items-center gap-2 text-[#5DA7DB]">
            <Cloud className="w-5 h-5" fill="#5DA7DB" />
            <span className="font-bold text-sm tracking-wide">Cinnamoroll Tasks</span>
          </div>
          <div className="flex items-center gap-2 no-drag ml-auto">
            <a 
              href="/cinnamoroll-tasks-full-source.zip" 
              download="cinnamoroll-tasks-full-source.zip"
              title="Download Full Project Folder (.ZIP)"
              className="px-2.5 py-1 bg-white/90 hover:bg-white text-[#5DA7DB] rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-sm border border-[#B9E0F7] hover:scale-105 transition-all cursor-pointer"
            >
              <Download className="w-3 h-3 text-[#5DA7DB]" />
              <span>Download Code (.zip)</span>
            </a>
            <button 
              onClick={handleMinimize}
              className="w-3 h-3 bg-[#B9E0F7] rounded-full hover:scale-110 transition-transform flex items-center justify-center group"
              title="Minimize"
            >
              <Minus className="w-2 h-2 opacity-0 group-hover:opacity-100 text-[#5DA7DB]" strokeWidth={3} />
            </button>
            <button 
              onClick={handleClose}
              className="w-3 h-3 bg-[#FBCFE8] rounded-full hover:scale-110 transition-transform flex items-center justify-center group"
              title="Close"
            >
              <X className="w-2 h-2 opacity-0 group-hover:opacity-100 text-[#D982B5]" strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Header Graphic */}
        <div className="pt-4 pb-2 px-6 flex justify-start items-center relative min-h-[120px] overflow-hidden rounded-t-[40px]">
          <img src={HeaderImg} alt="Cinnamoroll Header Background" className="absolute inset-0 w-full h-full object-cover opacity-60 z-0" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent z-0"></div>
          
          <div className="flex flex-col z-10">
            <h1 className="text-2xl font-black text-[#5DA7DB] tracking-tight">
              My To-Do
            </h1>
            <p className="text-sm text-[#8AC6EE] font-medium mt-1">Tell Cinnamoroll what will u do!</p>
          </div>
        </div>

        {/* In-App Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-16 left-6 right-6 bg-[#E0F2FE] border-2 border-[#B9E0F7] shadow-lg rounded-2xl p-3 z-50 flex items-center gap-3"
            >
              <Bell className="w-5 h-5 text-[#5DA7DB] shrink-0" />
              <p className="text-xs text-[#5DA7DB] font-semibold">{toastMessage}</p>
              <button 
                onClick={() => setToastMessage(null)}
                className="ml-auto text-[#8AC6EE] hover:text-[#5DA7DB]"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          <AnimatePresence>
            {tasks.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="flex flex-col items-center justify-center h-full text-[#8AC6EE]/60 space-y-2"
              >
                <Cloud className="w-12 h-12" />
                <p className="text-sm font-semibold">No tasks yet!</p>
              </motion.div>
            ) : (
              tasks.map(task => (
                <div key={task.id} className="flex flex-col gap-1">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  className={`flex items-start gap-3 p-4 rounded-[24px] border-b-4 group transition-all ${
                    task.completed 
                      ? 'bg-white/50 border-white' 
                      : 'bg-white border-[#B9E0F7]'
                  }`}
                >
                  <button 
                    onClick={() => toggleTask(task.id)}
                    className={`flex-shrink-0 mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      task.completed 
                        ? 'bg-[#B9E0F7] border-[#B9E0F7] text-white' 
                        : 'border-[#B9E0F7] text-transparent hover:bg-[#B9E0F7]/20'
                    }`}
                  >
                    <Check className="w-4 h-4" strokeWidth={3} />
                  </button>
                  
                  <div className="flex-1 flex flex-col min-w-0">
                    <span className={`text-sm font-semibold break-words whitespace-normal transition-all ${
                      task.completed ? 'text-[#B9E0F7] line-through' : 'text-[#5DA7DB]'
                    }`}>
                      {task.text}
                    </span>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {task.repeatable && (
                        <span className="text-[9px] bg-[#FBCFE8] text-[#D982B5] px-2 py-0.5 rounded-full font-bold uppercase w-max">
                          Daily Repeatable
                        </span>
                      )}
                      {task.reminderTime && !task.completed && (
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase w-max ${
                           task.reminderNotified ? 'bg-[#E0F2FE] text-[#B9E0F7]' : 'bg-[#D1FAE5] text-[#34D399]'
                        }`}>
                          🔔 {new Date(task.reminderTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1 shrink-0 mt-0.5">
                    <button
                      onClick={() => toggleRepeatable(task.id)}
                      title="Toggle Repeatable (Resets at 00:00)"
                      className={`p-1.5 rounded-full transition-colors ${
                        task.repeatable 
                          ? 'bg-[#FDF2F8] text-[#D982B5]' 
                          : 'text-[#B9E0F7] hover:bg-[#E0F2FE]'
                      }`}
                    >
                      <Repeat className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingReminderId(editingReminderId === task.id ? null : task.id)}
                      title="Set Reminder"
                      className={`p-1.5 rounded-full transition-colors ${
                        task.reminderTime 
                          ? 'bg-[#E0F2FE] text-[#6BB4E4]' 
                          : 'text-[#B9E0F7] hover:bg-[#E0F2FE]'
                      }`}
                    >
                      <Bell className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1.5 rounded-full text-[#FECACA] opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
                
                {/* Reminder Editor Popover */}
                <AnimatePresence>
                  {editingReminderId === task.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center gap-2 bg-[#F5FAFF] p-3 rounded-xl border-2 border-[#B9E0F7]/30 ml-10 mb-2">
                        <input 
                          type="datetime-local" 
                          value={task.reminderTime || ''}
                          onChange={(e) => setReminder(task.id, e.target.value)}
                          className="flex-1 min-w-0 w-full text-xs text-[#5DA7DB] bg-white border border-[#B9E0F7]/50 rounded-lg p-1.5 focus:outline-none focus:border-[#B9E0F7]"
                        />
                        <button 
                          onClick={() => { setReminder(task.id, null); setEditingReminderId(null); }}
                          className="shrink-0 text-xs font-bold text-[#D982B5] bg-[#FDF2F8] px-3 py-1.5 rounded-lg hover:bg-[#FBCFE8] transition-colors"
                        >
                          Clear
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
            )}
          </AnimatePresence>
        </div>

        {/* Add Task Form */}
        <div className="p-4 bg-white/60 backdrop-blur z-10">
          <form onSubmit={handleAdd} className="flex flex-col gap-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a cute task..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                className="flex-1 bg-white border-2 border-[#B9E0F7] rounded-[24px] px-4 py-2.5 text-sm text-[#5DA7DB] placeholder-[#B9E0F7] focus:outline-none focus:ring-4 focus:ring-[#B9E0F7]/20 transition-all shadow-inner"
              />
              <button
                type="submit"
                disabled={!newTaskText.trim()}
                className="bg-[#B9E0F7] text-white p-2.5 rounded-[24px] hover:bg-[#A3D4F2] disabled:opacity-50 transition-all shadow-lg shadow-[#B9E0F7]/40 flex items-center justify-center font-bold px-4"
              >
                Add
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
