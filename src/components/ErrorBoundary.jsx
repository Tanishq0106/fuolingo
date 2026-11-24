import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('Fuolingo Error Boundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-surface-card border border-red-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center text-2xl">
              ⚠️
            </div>
            
            <h2 className="text-xl font-bold text-white">Something went wrong</h2>
            
            <p className="text-xs sm:text-sm text-slate-400">
              Fuolingo caught an unexpected display error. Your streak, missions, and weight data remain safely saved.
            </p>

            {this.state.error && (
              <div className="p-3 bg-slate-950/80 rounded-xl border border-white/5 text-left overflow-auto max-h-32 text-[11px] font-mono text-red-300">
                {this.state.error.toString()}
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleReset}
                className="px-4 py-2.5 rounded-xl bg-surface-light hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
              >
                Try to Recover
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-xs font-bold text-slate-950 shadow-accent-glow transition-all"
              >
                Reload Fuolingo
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
