webSocket = new WebSocket('ws://' + location.host + "/api/v1/screen/ws");

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
}
*/

function createTable(table, lines, sum, from, amount) {
    while (table.rows.length <= amount) {
        table.insertRow();
    }

    for (let i = 0; (i < amount && i < table.rows.length && i + from < lines.length); i++) {
        let line = lines[i + from];
        let row = table.rows[i];
        if (line.shown) {
            row.innerHTML += `<tr><td>${i + from + 1}</td><td>${line.text}</td><td>${line.points}</td></tr>`;
        } else {
            row.innerHTML += `<tr><td>${i + from + 1}</td><td>.......................</td><td>__</td></tr>`;
        }
    }

    let row = table.rows[amount];

    if (lines.length <= from + amount) {
        row.innerHTML += `<tr><td></td><td class="sum">SUMA</td><td>${sum}</td></tr>`;
    } else {
        row.innerHTML += `<tr><td></td><td></td><td></td></tr>`;
    }
}

function getScreenAddress(path) {
    return location.protocol + '//' + location.host + "/api/" + apiVersion + "/screen/" + path;
}


const apiVersion = "v1";

fetch(getScreenAddress("state")).then((data) => {
    data.json().then((json) => {
        update(json);
    });
})


function update(screen) {
    let table = document.getElementById("table");
    table.innerHTML = "";

    for (let i = 0; i < screen.lines.length; i+= 6) {
        createTable(table, screen.lines, screen.sum, i, 6);
    }

    document.getElementById("left").classList = [];
    document.getElementById("right").classList = [];

    if (screen.team == 1) {
        document.getElementById("left").classList = ["playing"];
        document.getElementById("right").classList = ["notplaying"];
    } else if (screen.team == 2) {
        document.getElementById("right").classList = ["playing"];
        document.getElementById("left").classList = ["notplaying"];
    }

    for (n of document.getElementsByTagName("aside")) {
        n.innerHTML = "";
    }

    let strikes = screen.strikes;

    if (strikes > 3) {
        for (n of document.getElementsByClassName("playing")) {
            n.innerHTML = "<div>X</div><div>X</div><div>X</div>"
        }

        for (n of document.getElementsByClassName("notplaying")) {
            n.innerHTML = "<div>X</div>"
        }
    } else {
        for (n of document.getElementsByClassName("playing")) {
            for (let i = 0; i < strikes; i++) {
                n.innerHTML += "<div>X</div>";  
            }
        }
    }

}

webSocket.onmessage = (event) => {
    update(JSON.parse(event.data));
};