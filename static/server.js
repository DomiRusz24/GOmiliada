screen = new WebSocket('ws://' + location.host + "/api/v1/screen/ws");
button = new WebSocket('ws://' + location.host + "/api/v1/server/ws");

/*
type Button struct {
	Team int `json:"team"`
}
*/

/*
type ScreenLine struct {
	Text    string `json:"text"`
	Points  uint16 `json:"points"`
	Guessed bool   `json:"guessed"`
	Shown   bool   `json:"shown"`
}

type Screen struct {
    Lines      []ScreenLine `json:"lines"`
    Sum        int          `json:"sum"`
    Team       int          `json:"team"` // 0 - none, 1 - left, 2 - right
    Strikes    int          `json:"strikes"`
    LeftPoint  int          `json:"left_points"`
    RightPoint int          `json:"right_points"`
    Question   string       `json:"question"`
}
*/

const apiVersion = "v1";


function getAddress(path) {
    return location.protocol + '//' + location.host + "/api/" + apiVersion + "/server/" + path;
}

function getScreenAddress(path) {
    return location.protocol + '//' + location.host + "/api/" + apiVersion + "/screen/" + path;
}

fetch(getScreenAddress("state")).then((data) => {
    data.json().then((json) => {
        updateScreen(json);
    });
})

function updateScreen(screen) {

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
}

function resetClick() {
    document.getElementById("lastclick").style.backgroundColor = "rgba(0, 0, 0, 0)";
    buttonState = false;
}

function guess(id) {
    fetch(getAddress(`uncover?id=${id}`))
}

function show(id) {
    fetch(getAddress(`show?id=${id}`))
}

var buttonState = false;

function updateButton(button) {
    team = button.team;

    if (!buttonState) {
        buttonState = true;
        if (team == 1) {
            document.getElementById("lastclick").style.backgroundColor = "blue";
        } else if (team == 2) {
            document.getElementById("lastclick").style.backgroundColor = "red";
        }
    }

}

function strike() {
    fetch(getAddress("strike"))
}


function unstrike() {
    fetch(getAddress("unstrike"))
}

function reset() {
    fetch(getAddress("reset"))
}


function play(team) {
    fetch(getAddress(`play?team=${team}`))
}

function next() {
    fetch(getAddress("next"))
}

function setPoints(team) {
    let points = Number(prompt("Points:"));

    fetch(getAddress(`setpoints?team=${team}&points=${points}`))
}

screen.onmessage = (event) => {
    updateScreen(JSON.parse(event.data));
};

button.onmessage = (event) => {
    updateButton(JSON.parse(event.data));
};