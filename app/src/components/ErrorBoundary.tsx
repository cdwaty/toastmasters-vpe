import { Component, ReactNode } from 'react';
import { Button } from './ui';
import { log } from '../lib/logger';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: unknown) {
    log.error(
      { error: error.message, stack: error.stack, info, route: window.location.pathname },
      'ErrorBoundary caught render failure',
    );
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    if (this.props.fallback) return this.props.fallback(error, this.reset);
    return (
      <div className="min-h-screen grid place-items-center p-6 bg-gradient-to-b from-cream to-[#f5ede2]">
        <div className="w-full max-w-md bg-white border border-line rounded-2xl p-9 shadow-pop">
          <h1 className="font-serif text-2xl text-ink">Something went wrong</h1>
          <p className="text-sm text-ink-light mt-1 mb-6">{error.message}</p>
          <Button onClick={this.reset}>Try again</Button>
        </div>
      </div>
    );
  }
}
