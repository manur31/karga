
const formatSeconds = (seconds, hours = false) => {
    const minute = Math.floor(seconds / 60);
    const sec = seconds % 60;
    if (hours || minute >= 60) {
        const hour = Math.floor(minute / 60);
        const min = minute % 60;
        return [hour, min, sec].map((n) => String(n).padStart(2, "0")).join(":").replace(/^00+/, "0");
    }
    return [minute, sec].map((n) => String(n).padStart(2, "0")).join(":").replace(/^00+/, "0");
}

export default formatSeconds;