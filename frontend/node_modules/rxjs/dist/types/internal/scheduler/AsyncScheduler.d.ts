import { Scheduler } from '../../../../src/internal/Scheduler';
import { Action } from '../../../../src/internal/scheduler/Action';
import { AsyncAction } from '../../../../src/internal/scheduler/AsyncAction';
export declare class AsyncScheduler extends Scheduler {
    actions: Array<AsyncAction<any>>;
    constructor(SchedulerAction: typeof Action, now?: () => number);
    flush(action: AsyncAction<any>): void;
}
//# sourceMappingURL=AsyncScheduler.d.ts.map