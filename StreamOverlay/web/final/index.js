window.onload = () => {
    const firstTeamEl = document.getElementById('firstTeam');
    const secondTeamEl = document.getElementById('secondTeam');
    const thirdTeamEl = document.getElementById('thirdTeam');
        setInterval(() => {
            fetch('/getRanking')
            .then(res => res.json())
            .then((data) => {
                firstTeamEl.innerText = data.first;
                secondTeamEl.innerText = data.second;
                thirdTeamEl.innerText = data.third;
            })
        }, 1000)
}