var apiVersion = "v1";

function getAddress(path) {
    return location.protocol + '//' + location.host + "/api/" + apiVersion + "/server/" + path;
}

function clickButton(team) {
    fetch(getAddress(`button?team=${team}`))
}