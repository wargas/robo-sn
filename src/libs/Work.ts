import EventEmitter from "eventemitter3";
import { Progress } from "./Progress";
import { Queue } from "./Queue";
import QueueType from 'queue'
import type { SingleBar } from "cli-progress";

export class Work {
    public progress: SingleBar;
    public queue: QueueType;
    public events: EventEmitter;

    constructor() {
        this.progress = Progress.factory("[{value}/{total}] {bar} | {percentage}% | {duration_formatted} ");
        this.queue = Queue.factory();
        this.events = new EventEmitter();
    }

    async Factory() {
        
    }
}