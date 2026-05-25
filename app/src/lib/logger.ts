type Level = 'info' | 'warn' | 'error';

type Context = Record<string, unknown>;

interface LogEntry {
  level: Level;
  message: string;
  context: Context;
  timestamp: string;
}

const sessionContext: Context = {};

const isDev = import.meta.env.DEV;

function emit(entry: LogEntry) {
  if (isDev) {
    const fn = entry.level === 'error'
      ? console.error
      : entry.level === 'warn'
        ? console.warn
        : console.info;
    fn(`[${entry.level}] ${entry.message}`, entry.context);
    return;
  }

  if (entry.level === 'error') {
    console.error(entry.message, entry.context);
  }
}

function write(level: Level, contextOrMessage: Context | string, maybeMessage?: string) {
  const context = typeof contextOrMessage === 'string' ? {} : contextOrMessage;
  const message = typeof contextOrMessage === 'string' ? contextOrMessage : (maybeMessage ?? '');
  emit({
    level,
    message,
    context: { ...sessionContext, ...context },
    timestamp: new Date().toISOString(),
  });
}

export const log = {
  info: (contextOrMessage: Context | string, message?: string) =>
    write('info', contextOrMessage, message),
  warn: (contextOrMessage: Context | string, message?: string) =>
    write('warn', contextOrMessage, message),
  error: (contextOrMessage: Context | string, message?: string) =>
    write('error', contextOrMessage, message),
  setUser: (userId: string | null) => {
    if (userId) sessionContext.userId = userId;
    else delete sessionContext.userId;
  },
  setContext: (key: string, value: unknown) => {
    if (value === undefined) delete sessionContext[key];
    else sessionContext[key] = value;
  },
};
