interface Watcher {
  // eslint-disable-next-line no-unused-vars
  (param: string): void;
}
export class ApplicationState {
  private watchers: Map<string, Watcher>;

  private setValue(key: string, value: string): void {
    const watcherDelegate = this.watchers.get(key);
    if (watcherDelegate) {
      watcherDelegate(value);
    }
  }

  private currentFile: string;
  set CurrentFile(val: string) {
    this.currentFile = val;
    this.setValue('CurrentFile', val);
  }
  get CurrentFile(): string {
    return this.currentFile;
  }

  Watch(variableName: string, watcher: Watcher): void {
    this.watchers.set(variableName, watcher);
  }

  constructor() {
    this.currentFile = 'Untitled';
    this.watchers = new Map<string, Watcher>();
  }
}
