export class BaseEvent<TData> {
  private readonly _listeners: ((v: TData) => void)[] = [];

  addEventListener(callback: (v: TData) => void) {
    this._listeners.push(callback);

    return {
      unsubscribe: () => this.removeEventListener(callback),
    };
  }

  emit(value: TData) {
    this._listeners.forEach((f) => f(value));
  }

  removeEventListener(callback: (v: TData) => void) {
    this._listeners.splice(this._listeners.indexOf(callback), 1);
  }
}
