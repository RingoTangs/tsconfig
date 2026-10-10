import { Service } from './service.js'

function Injectable(): ClassDecorator {
  return () => {}
}

function Inject(): ParameterDecorator {
  return () => {}
}

@Injectable()
export class Consumer {
  constructor(@Inject() private readonly service: Service) {}

  getMessage(): string {
    return this.service.message
  }
}
