import React, { useState } from 'react';
import { useToast } from '../components/ToastProvider.jsx';
import { useConfetti } from '../components/Confetti.jsx';

export default function Workouts({ onCompleteWorkout = () => {} }) {
  const { toast } = useToast();
  const { burst } = useConfetti();
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  const workoutsList = [
    {
      id: 'w1',
      title: 'High-Intensity Metabolic Burner',
      category: 'HIIT & Cardio',
      duration: '25 min',
      level: 'Intermediate',
      calories: '320 kcal',
      color: 'accent',
      exercises: [
        { name: 'Jumping Jacks Warmup', sets: '2 sets', reps: '45 sec' },
        { name: 'Explosive Bodyweight Squats', sets: '3 sets', reps: '15 reps' },
        { name: 'Mountain Climbers', sets: '3 sets', reps: '40 sec' },
        { name: 'Push-up to Shoulder Tap', sets: '3 sets', reps: '12 reps' },
        { name: 'High Knees Sprint', sets: '3 sets', reps: '30 sec' },
        { name: 'Plank Hold Finisher', sets: '2 sets', reps: '60 sec' }
      ]
    },
    {
      id: 'w2',
      title: 'Upper Body Hypertrophy & Power',
      category: 'Strength & Muscle',
      duration: '35 min',
      level: 'All Levels',
      calories: '280 kcal',
      color: 'violet',
      exercises: [
        { name: 'Dumbbell Bench / Floor Press', sets: '4 sets', reps: '10-12 reps' },
        { name: 'Bent-Over Dumbbell Rows', sets: '4 sets', reps: '12 reps' },
        { name: 'Overhead Dumbbell Shoulder Press', sets: '3 sets', reps: '10 reps' },
        { name: 'Incline Push-ups', sets: '3 sets', reps: '15 reps' },
        { name: 'Dumbbell Hammer Curls', sets: '3 sets', reps: '12 reps' },
        { name: 'Diamond Push-ups', sets: '3 sets', reps: '10 reps' }
      ]
    },
    {
      id: 'w3',
      title: 'Iron Core & Athletic Calisthenics',
      category: 'Core & Endurance',
      duration: '20 min',
      level: 'Intermediate',
      calories: '210 kcal',
      color: 'streak',
      exercises: [
        { name: 'Hanging Knee Raises / Lying Leg Raises', sets: '3 sets', reps: '15 reps' },
        { name: 'Bicycle Crunches', sets: '3 sets', reps: '20 reps' },
        { name: 'Russian Twists', sets: '3 sets', reps: '20 reps' },
        { name: 'Side Plank Reach-Throughs', sets: '3 sets', reps: '10 each side' },
        { name: 'Hollow Body Hold', sets: '3 sets', reps: '30 sec' }
      ]
    },
    {
      id: 'w4',
      title: 'Restorative Mobility & Deep Stretch',
      category: 'Recovery & Flexibility',
      duration: '15 min',
      level: 'Beginner Friendly',
      calories: '90 kcal',
      color: 'sky',
      exercises: [
        { name: 'Cat-Cow Spinal Flow', sets: '2 sets', reps: '60 sec' },
        { name: "World's Greatest Stretch", sets: '2 sets', reps: '5 each side' },
        { name: 'Pigeon Pose Hip Opener', sets: '2 sets', reps: '45 sec hold' },
        { name: 'Thoracic Spine Rotations', sets: '2 sets', reps: '10 reps' },
        { name: "Child's Pose Deep Breathing", sets: '1 set', reps: '90 sec' }
      ]
    }
  ];

  const handleStartWorkout = (workout) => {
    setActiveWorkout(workout);
    setTimerSeconds(0);
    setTimerRunning(true);
  };

  const handleFinishWorkout = () => {
    if (!activeWorkout) return;
    onCompleteWorkout(activeWorkout);
    toast({
      message: `Workout "${activeWorkout.title}" completed! Mission ticked! 🏋️`,
      type: 'success'
    });
    burst({ intensity: 'normal' });
    setActiveWorkout(null);
    setTimerRunning(false);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
          <span>Workout Plans & Training Engine</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-accent/15 border border-accent/20 text-accent font-semibold">
            Guided
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Complete any workout session below to automatically satisfy today's Daily Workout mission.
        </p>
      </div>

      {/* Workout Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {workoutsList.map((workout) => (
          <div
            key={workout.id}
            className="bg-surface-card rounded-3xl p-6 sm:p-7 border border-white/5 shadow-xl flex flex-col justify-between group hover:border-white/20 transition-all"
          >
            <div className="space-y-4">
              {/* Badges */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-accent px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20">
                  {workout.category}
                </span>
                <span className="text-xs font-mono text-slate-400 font-medium">
                  ⏱️ {workout.duration} • 🔥 {workout.calories}
                </span>
              </div>

              {/* Title */}
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-accent transition-colors">
                  {workout.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Level: {workout.level}
                </p>
              </div>

              {/* Exercise Preview */}
              <div className="bg-surface/60 rounded-2xl p-4 border border-white/5 space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Routine Outline ({workout.exercises.length} movements):
                </div>
                <div className="divide-y divide-white/5 text-xs">
                  {workout.exercises.slice(0, 3).map((ex, i) => (
                    <div key={i} className="py-1.5 flex justify-between text-slate-300">
                      <span>{ex.name}</span>
                      <span className="font-mono text-slate-400">{ex.sets} × {ex.reps}</span>
                    </div>
                  ))}
                  {workout.exercises.length > 3 && (
                    <div className="pt-1.5 text-[11px] text-accent font-medium">
                      + {workout.exercises.length - 3} more movements
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Launch Button */}
            <button
              type="button"
              onClick={() => handleStartWorkout(workout)}
              className="mt-6 w-full py-3 rounded-xl font-bold text-sm bg-accent hover:bg-accent-hover text-slate-950 shadow-accent-glow transition-all flex items-center justify-center gap-2"
            >
              <span>Start Workout Now</span>
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Active Workout Modal Player */}
      {activeWorkout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl bg-surface border border-accent/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-accent">
                  Active Session
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                  {activeWorkout.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveWorkout(null)}
                className="text-slate-400 hover:text-white p-2 rounded-xl"
              >
                ✕
              </button>
            </div>

            {/* Workout Movements list */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Movements & Protocol
              </h4>
              <div className="space-y-2">
                {activeWorkout.exercises.map((ex, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-surface-card border border-white/5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-800 text-accent text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className="text-sm font-semibold text-white">{ex.name}</span>
                    </div>
                    <span className="text-xs font-mono text-slate-300 bg-slate-800 px-2.5 py-1 rounded-lg">
                      {ex.sets} × {ex.reps}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setActiveWorkout(null)}
                className="flex-1 py-3 rounded-xl bg-surface-light text-slate-300 font-semibold text-sm hover:bg-slate-700 transition-colors"
              >
                Pause / Exit
              </button>
              <button
                type="button"
                onClick={handleFinishWorkout}
                className="flex-1 py-3 rounded-xl bg-accent hover:bg-accent-hover text-slate-950 font-bold text-sm shadow-accent-glow transition-all"
              >
                Finish & Mark Mission Done ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
