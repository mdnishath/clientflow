import { EventEmitter } from "events";

export class AutomationEventEmitter extends EventEmitter { }

const globalForEvents = global as unknown as { automationEvents: AutomationEventEmitter };

export const automationEvents = globalForEvents.automationEvents || new AutomationEventEmitter();

if (process.env.NODE_ENV !== "production") globalForEvents.automationEvents = automationEvents;
