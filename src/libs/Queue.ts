import queue from 'queue'

export class Queue {

    static factory() {
        return new queue({
            concurrency: 1,
            autostart: true
        })
    }

}