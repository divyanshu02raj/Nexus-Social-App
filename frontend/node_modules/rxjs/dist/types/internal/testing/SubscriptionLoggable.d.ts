import { Scheduler } from '../../../../src/internal/Scheduler';
import { SubscriptionLog } from '../../../../src/internal/testing/SubscriptionLog';
export declare class SubscriptionLoggable {
    subscriptions: SubscriptionLog[];
    scheduler: Scheduler;
    logSubscribedFrame(): number;
    logUnsubscribedFrame(index: number): void;
}
//# sourceMappingURL=SubscriptionLoggable.d.ts.map