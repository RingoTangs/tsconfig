export enum Status {
  Ready = 'ready',
}

export class Service {
  constructor(readonly status: Status) {}
}
