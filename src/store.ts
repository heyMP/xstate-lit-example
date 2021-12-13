import type { ReactiveControllerHost, ReactiveController } from 'lit';
import { createMachine, send, assign, interpret } from 'xstate'
import type { Interpreter, Subscription, StateMachine } from 'xstate';

export interface CounterContext {
	count: number
}

export type CounterEvent =
  | { type: 'INCREMENT' }
  | { type: 'DECREMENT' }

export type CounterTypestate =
  | { value: 'init', context: CounterContext }
  | { value: 'cooldown', context: CounterContext }

// Edit your machine(s) here
export const storeMachine = createMachine<CounterContext, CounterEvent, CounterTypestate>({
	id: "counter",
	initial: "init",
	context: {
		count: 0,
	},
	states: {
		init: {
			on: {
				INCREMENT: {
					actions: ['increment'],
					cond: 'withinThreshold',
				},
				DECREMENT: {
					actions: ['decrement'],
					cond: 'isNotMin'
				},
				'': [
					{ target: 'cooldown', cond: 'aboveThreshold' }
				]
			}
		},
		cooldown: {
			after: {
        1000: {
          target: 'cooldown',
          actions: 'decrement',
          cond: (context) => context.count > 0
        }
      },
      on: {
				// only allow decrement in cooldown state
				DECREMENT: {
					actions: ['decrement'],
					cond: 'isNotMin'
				},
				'': [
					{ target: 'init', cond: (context) => context.count === 0 }
				]
			}
		}
	},
}, {
	// Actions (anything that directly mutates state)
	actions: {
		increment: assign((context) => ({
			count: context.count + 1
		})),
		decrement: assign((context) => ({
			count: context.count - 1
		})),
	},
	// Guards
	guards: {
		withinThreshold: context => context.count < 10,
		aboveThreshold: context => context.count >= 10,
		isNotMin: context => context.count > 0,
	}
})

export class StoreController implements ReactiveController {
  // reference to the host element using this controller
  host: ReactiveControllerHost & Element;
  store;
  subscription?: Subscription;

  constructor(host: ReactiveControllerHost & Element, cb?: Function) {
    (this.host = host).addController(this);
    this.store = interpret(storeMachine).start();
		this.subscription = this.store.subscribe(() => {
			this.host.requestUpdate();
		});
  }

  hostDisconnected() {
    this.subscription?.unsubscribe();
  }
}