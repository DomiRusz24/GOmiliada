onScreenUpdate((screen) => {
    document.getElementById("players").innerText = screen.team == 1 ? "Blue" : screen.team == 2 ? "Red" : "None";

    document.getElementById("question").innerText = screen.question;

    for (let i = 0; i < screen.strikes; i++) {
        document.getElementById("players").innerText += " X";
    }


    document.getElementById("strike").disabled = screen.team == 0;
    document.getElementById("unstrike").disabled = screen.strikes == 0;

    document.getElementById("points-blue").innerText = `Blue: ${screen.left_points}`;
    document.getElementById("points-red").innerText = `Red: ${screen.right_points}`;


    let table = document.getElementById("table");

    table.innerHTML = '';

    let i = 1;

    for (line of screen.lines) {
        row = ""
        row += `<tr><td>${i}</td><td>${line.text}</td><td>${line.points}</td>`;

        if (!line.guessed) {
            row += `<td><button onclick="guess(${i - 1})">Guess</button></td>`
        } else {
            row += `<td><button disabled>Guess</button></td>`
        }

        if (!line.shown) {
            row += `<td><button onclick="show(${i - 1})">Show</button></td>`
        } else {
            row += `<td><button disabled>Show</button></td>`
        }

        row += `</tr>`;

        table.innerHTML+= row;

        i++;
    }
});

var buttonState = false;

function resetClick() {
    document.getElementById("lastclick").style.backgroundColor = "rgba(0, 0, 0, 0)";
    buttonState = false;
}

onButtonUpdate((button) => {
    team = button.team;

    if (!buttonState) {
        buttonState = true;
        if (team == 1) {
            document.getElementById("lastclick").style.backgroundColor = "blue";
        } else if (team == 2) {
            document.getElementById("lastclick").style.backgroundColor = "red";
        }
    }
});

function setPoints(team) {
    let points = Number(prompt("Points:"));

    setPoints(team, points);
}