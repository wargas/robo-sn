import { MultiBar, Presets, SingleBar } from 'cli-progress'

export class Progress {

    static factory(format: string, ) {
        return new SingleBar({
            format,
            
        }, Presets.shades_grey)
    }

    static multi(format: string) {
        return new MultiBar({
            clearOnComplete: false,
            format,
        }, Presets.shades_grey)
    }
}