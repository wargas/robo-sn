export function dateToSQL(s: string) {
    return s.replace(/(\d{2})\/(\d{2})\/(\d{4}) (.*)/, "$3-$2-$1 $4")
}

export function range(start: number, count: number): number[] {
    return Array(count).fill("").map((_,i) => start+i)
}