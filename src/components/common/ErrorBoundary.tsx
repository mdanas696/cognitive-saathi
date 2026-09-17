import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, LayoutDashboard } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CognitiveSaathi ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  public componentDidUpdate(prevProps: Props) {
    // If the view or children changed, automatically attempt recovery
    if (this.state.hasError && (prevProps.children !== this.props.children || prevProps.fallbackTitle !== this.props.fallbackTitle)) {
      this.setState({ hasError: false, error: null });
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 bg-stone-50 dark:bg-[#12161C] text-stone-900 dark:text-stone-100 rounded-3xl border border-stone-200 dark:border-stone-800 m-4">
          <div className="max-w-md w-full text-center space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto shadow-xs">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold font-serif-heading text-stone-900 dark:text-stone-100">
                {this.props.fallbackTitle || 'Display Refresh Needed'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                Your patient data and saved progress are completely safe. A display transition issue occurred, and we can restore your screen immediately.
              </p>
            </div>

            {this.state.error && (
              <div className="text-left p-3 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-[11px] font-mono text-stone-700 dark:text-stone-300 overflow-x-auto max-h-24">
                <p className="font-semibold text-rose-700 dark:text-rose-400">{this.state.error.message || 'Unknown view error'}</p>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="px-5 py-2.5 rounded-2xl bg-teal-800 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm transition flex items-center gap-2 shadow-xs cursor-pointer active:scale-95"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Return to Overview</span>
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2.5 rounded-2xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 font-semibold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
