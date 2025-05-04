export function formatDate(date:string) {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    })
}

export const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));