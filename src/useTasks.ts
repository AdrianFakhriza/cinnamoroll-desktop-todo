import { useState, useEffect } from 'react';
import { Task } from './types';

const STORAGE_KEY = 'cinnamoroll-tasks';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsedTasks: Task[] = JSON.parse(saved);
        // Reset logic on initial load
        const todayStr = new Date().toDateString();
        return parsedTasks.map((task) => {
          let updatedTask = { ...task };
          // Migrate old tasks to new fields
          if (updatedTask.reminderTime === undefined) {
            updatedTask.reminderTime = null;
            updatedTask.reminderNotified = false;
          }
          if (updatedTask.repeatable && updatedTask.completed && updatedTask.lastCompletedDate !== todayStr) {
            updatedTask.completed = false;
            updatedTask.lastCompletedDate = null;
          }
          return updatedTask;
        });
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  // Periodic check to reset at 00:00 and check reminders
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const todayStr = now.toDateString();

      setTasks((prevTasks) => {
        let changed = false;
        const newTasks = prevTasks.map((task) => {
          let updatedTask = { ...task };

          // 1. Repeatable check
          if (updatedTask.repeatable && updatedTask.completed && updatedTask.lastCompletedDate !== todayStr) {
            changed = true;
            updatedTask.completed = false;
            updatedTask.lastCompletedDate = null;
          }

          // 2. Reminder check
          if (updatedTask.reminderTime && !updatedTask.reminderNotified && !updatedTask.completed) {
            const reminderDate = new Date(updatedTask.reminderTime);
            if (now >= reminderDate) {
              // Trigger notification
              if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
                new Notification('Cinna Tasks ☁️', {
                  body: `Reminder: ${updatedTask.text}`
                });
              }
              // Dispatch event for in-app toast (works in sandbox and as fallback)
              window.dispatchEvent(new CustomEvent('show-toast', { detail: `Reminder: ${updatedTask.text}` }));
              
              updatedTask.reminderNotified = true;
              changed = true;
            }
          }

          return updatedTask;
        });
        return changed ? newTasks : prevTasks;
      });
    }, 10000); // Check every 10 seconds for more accurate reminders

    return () => clearInterval(interval);
  }, []);

  const addTask = (text: string, repeatable: boolean = false) => {
    if (!text.trim()) return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      repeatable,
      lastCompletedDate: null,
      reminderTime: null,
      reminderNotified: false,
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const toggleTask = (id: string) => {
    const todayStr = new Date().toDateString();
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          const isNowCompleted = !task.completed;
          return {
            ...task,
            completed: isNowCompleted,
            lastCompletedDate: isNowCompleted ? todayStr : null,
          };
        }
        return task;
      })
    );
  };

  const toggleRepeatable = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, repeatable: !task.repeatable } : task
      )
    );
  };

  const setReminder = (id: string, time: string | null) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, reminderTime: time, reminderNotified: false } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  return {
    tasks,
    addTask,
    toggleTask,
    toggleRepeatable,
    setReminder,
    deleteTask,
  };
}
