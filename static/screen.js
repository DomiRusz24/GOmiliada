function createTable(table, lines, sum, from, amount) {
    while (table.rows.length <= amount) {
        table.insertRow();
    }

    for (let i = 0; (i < amount && i < table.rows.length && i + from < lines.length); i++) {
        let line = lines[i + from];
        let row = table.rows[i];
        if (line.shown) {
            row.innerHTML += `<tr><td>${i + from + 1}</td><td class='text'>${line.text}</td><td>${line.points}</td></tr>`;
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

onScreenUpdate((screen) => {
    let table = document.getElementById("table");
    table.innerHTML = "";

    for (let i = 0; i < screen.lines.length; i+= 6) {
        createTable(table, screen.lines, screen.sum, i, 6);
    }

    if (screen.event == "correct") {
        document.getElementById("correct-sound").currentTime = 0;
        document.getElementById("correct-sound").play();
    }

    if (screen.event == "strike") {
        document.getElementById("wrong-sound").currentTime = 0;
        document.getElementById("wrong-sound").play();
    }
    
    prevSum = screen.sum;

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

    prevErrors = strikes;

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
});