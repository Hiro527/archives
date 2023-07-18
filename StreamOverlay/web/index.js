window.onload = () => {
    const team1El = document.getElementById('team1');
    const team2El = document.getElementById('team2');
    
    setInterval(() => {
        fetch('/getTeams')
        .then(res => res.json())
        .then((data) => {
            team1El.innerText = data.team1;
            team2El.innerText = data.team2;
        })
        .catch(error => console.error(error))
    }, 1000)
}