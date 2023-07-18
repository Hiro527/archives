window.onload = () => {
    const timerEl = document.getElementById('timer');
    setInterval(() => {
        const startTime = 1639825200; // 2021-12-18T20:00:00
        const now = Math.floor(new Date().getTime() / 1e3);
        const remainingTime = startTime - now;
        const min = remainingTime > 0 ? remainingTime / 60 | 0 : 0;
        const sec = remainingTime > 0 ? remainingTime % 60 : 0;
        timerEl.innerText = `${('00' + String(min)).slice(-2)}:${('00' + String(sec)).slice(-2)}`
    }, 1000)
}