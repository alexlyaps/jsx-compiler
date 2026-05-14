export class Observer {
  constructor(initialValue) {
    this.state = initialValue;
    this.listeners = [];
  }

  subscribe(listener) {
    this.listeners.push(listener);

    return () => this.unsubscribe(listener);
  }

  unsubscribe(listener) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  setState(nextState) {
    if (this.state === nextState) return;
    this.state = nextState;
    this.listeners.forEach((l) => l());
  }

  getState() {
    return this.state;
  }
}
