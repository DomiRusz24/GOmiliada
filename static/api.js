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

var apiVersion = "v1";


function getAddress(path) {
    return location.protocol + '//' + location.host + "/api/" + apiVersion + "/server/" + path;
}

function getScreenAddress(path) {
    return location.protocol + '//' + location.host + "/api/" + apiVersion + "/screen/" + path;
}

async function getState() {
    return fetch(getScreenAddress("state")).then((data) => {
        return data.json();
    });
}

function getWebSocketProtocol() {
    if (location.protocol !== 'https:') {
        return "ws://";
    } else {
        return "wss://";
    }
}

function onScreenUpdate(onUpdate) {
    screen = new WebSocket(getWebSocketProtocol() + location.host + "/api/" + apiVersion + "/screen/ws");

    getState().then((json) => {
        onUpdate(json);
    });

    screen.onmessage = (event) => {
        onUpdate(JSON.parse(event.data));
    };
}

function onButtonUpdate(onUpdate) {
    screen = new WebSocket(getWebSocketProtocol() + location.host + "/api/" + apiVersion + "/server/ws");

    screen.onmessage = (event) => {
        onUpdate(JSON.parse(event.data));
    };
}


async function guess(id) {
    return fetch(getAddress(`uncover?id=${id}`))
}

async function show(id) {
    return fetch(getAddress(`show?id=${id}`))
}


async function strike() {
    return fetch(getAddress("strike"))
}


async function unstrike() {
    return fetch(getAddress("unstrike"))
}

async function reset() {
    return fetch(getAddress("reset"))
}


async function play(team) {
    return fetch(getAddress(`play?team=${team}`))
}

async function next() {
    return fetch(getAddress("next"))
}

async function clickButton(team) {
    return fetch(getAddress(`button?team=${team}`))
}

async function setPoints(team, points) {
    return fetch(getAddress(`setpoints?team=${team}&points=${points}`))
}