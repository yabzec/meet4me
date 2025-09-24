interface Time {
    hours: number;
    minutes: number;
    seconds: number;
    days: number;
}

function padTo2Digits(num: number) {return num.toString().padStart(2, '0')}

function parseMillis(millis: number) {
    const totalSeconds = Math.floor(millis / 1000);
    return {
        hours: Math.floor(totalSeconds / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
    }
}

export function getDueDate(millis: number): string {
    const time = parseMillis(millis);
    const today = new Date();
    today.setHours(today.getHours() + time.hours, today.getMinutes() + time.minutes, today.getSeconds() + time.seconds);
    return today.toLocaleString().split(', ')[0];
}

export function millisecondsToTime(millis: number): string {
    const time = parseMillis(millis);

    return `${padTo2Digits(time.hours)}:${padTo2Digits(time.minutes)}:${padTo2Digits(time.seconds)}`;
}

export function timeToSeconds(timeString: string): number {
    let [hours, minutes, seconds] = timeString.split(':');

    if (seconds === undefined) {
        seconds = minutes;
        minutes = hours;
        hours = '0';
    }

    const totalSeconds = (+hours * 3600) + (+minutes * 60) + (+seconds);
    return totalSeconds;
}

export function getTitleDate(date: Date): string {
    const dateString = date.toLocaleString().split(', ')[0];
    return `${dateString} - ${padTo2Digits(date.getHours())}:${padTo2Digits(date.getMinutes())}`;
}
