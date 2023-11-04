export const sortAsc = (a, b) => a - b;
export function flatMap(arr, mapper) {
    return arr.reduce((acc, val, i) => {
        acc.push(...mapper(val, i, arr));
        return acc;
    }, []);
}
