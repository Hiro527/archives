window.onload = () => {
    const nextTeam1El = document.getElementById('nextTeam1');
    const nextTeam2El = document.getElementById('nextTeam2');
    const winnerNameEl = document.getElementById('winnerName');
    const loserNameEl = document.getElementById('loserName');
    const winnerPtsEl = document.getElementById('winnerPts');
    const loserPtsEl = document.getElementById('loserPts');
    const timerEl = document.getElementById('timer');
    let windowStatus = 0;

    setInterval(() => {
        fetch('/getResult')
        .then(res => res.json())
        .then((data) => {
            nextTeam1El.innerText = data.nextTeam1;
            nextTeam2El.innerText = data.nextTeam2;
            winnerNameEl.innerText = data.winner;
            loserNameEl.innerText = data.loser;
            winnerPtsEl.innerText = data.winnerPts;
            loserPtsEl.innerText = data.loserPts;
            const now = Math.floor(new Date().getTime() / 1e3);
            const remainingTime = data.startTime - now;
            const min = remainingTime > 0 ? remainingTime / 60 | 0 : 0;
            const sec = remainingTime > 0 ? remainingTime % 60 : 0;
            timerEl.innerText = `${('00' + String(min)).slice(-2)}:${('00' + String(sec)).slice(-2)}`
        })
        .catch(error => console.error(error))
    }, 1000)

    setInterval(() => {
        if (windowStatus) {
            document.getElementById('prevResult').style.display = 'block';
            document.getElementById('bracketHolder').style.display = 'none';
            windowStatus = 0
        }
        else {
            document.getElementById('prevResult').style.display = 'none';
            document.getElementById('bracketHolder').style.display = 'block';
            windowStatus = 1 
        }
    }, 1000 * 30);
}