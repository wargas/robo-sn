import { MultiBar, Presets, SingleBar } from 'cli-progress';

export class Progress {

    static factory(format: string, ) {
        const bar = new SingleBar({
            format,
            
        }, Presets.shades_grey)

        return bar;
    }

    static multi(format: string) {
        return new MultiBar({
            clearOnComplete: false,
            format,
        }, Presets.shades_grey)
    }
}