package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"slices"
	"strconv"

	"github.com/gorilla/websocket"
)

func handleServerWS(w http.ResponseWriter, r *http.Request, g *GameState) {
	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}
	defer c.Close()

	ch := make(chan interface{})

	g.buttonChannel.Register(ch)

	defer g.buttonChannel.Unregister(ch)

	for button := range ch {

		res, err := json.Marshal(button)
		if err != nil {
			log.Println("marshal:", err)
			break
		}

		err = c.WriteMessage(websocket.TextMessage, res)
		if err != nil {
			log.Println("write:", err)
			break
		}
	}
}

func handleUncover(w http.ResponseWriter, r *http.Request, g *GameState) {
	id, err := strconv.Atoi(r.FormValue("id"))
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	if id == -1 {
		g.strikes = g.strikes + 1
	} else {
		if !slices.Contains(g.guessed, id) {
			g.guessed = append(g.guessed, id)
		}
		if !slices.Contains(g.uncovered, id) {
			g.uncovered = append(g.uncovered, id)
		}
	}

	w.WriteHeader(http.StatusOK)

	g.sendScreenUpdateWithEvent("correct")

}

func handleShow(w http.ResponseWriter, r *http.Request, g *GameState) {
	id, err := strconv.Atoi(r.FormValue("id"))
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	if id != -1 {
		if !slices.Contains(g.uncovered, id) {
			g.uncovered = append(g.uncovered, id)
		}
	}

	w.WriteHeader(http.StatusOK)

	g.sendScreenUpdate()

}

func handleReset(w http.ResponseWriter, r *http.Request, g *GameState) {

	g.reset()

	w.WriteHeader(http.StatusOK)

	g.sendScreenUpdate()

}

func handlePlay(w http.ResponseWriter, r *http.Request, g *GameState) {
	id, err := strconv.Atoi(r.FormValue("team"))
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	if id == 1 || id == 2 {
		g.team = uint8(id)
	}

	w.WriteHeader(http.StatusOK)

	g.sendScreenUpdate()

}

func handleButton(w http.ResponseWriter, r *http.Request, g *GameState) {
	id, err := strconv.Atoi(r.FormValue("team"))
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	if id == 1 || id == 2 {
		g.buttonChannel.Submit(Button{id})
	}

	w.WriteHeader(http.StatusOK)

}

func handleSetPoint(w http.ResponseWriter, r *http.Request, g *GameState) {
	team, err := strconv.Atoi(r.FormValue("team"))
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	points, err := strconv.Atoi(r.FormValue("points"))
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	if team == 1 {
		g.leftPoint = uint16(points)
	} else if team == 2 {
		g.rightPoint = uint16(points)
	}

	g.sendScreenUpdate()

	w.WriteHeader(http.StatusOK)

}

func handleNext(w http.ResponseWriter, r *http.Request, g *GameState) {

	g.newRound()

	g.sendScreenUpdate()

	w.WriteHeader(http.StatusOK)

}

func handleStrike(w http.ResponseWriter, r *http.Request, g *GameState) {

	g.strikes = g.strikes + 1

	g.sendScreenUpdateWithEvent("strike")

	w.WriteHeader(http.StatusOK)

}

func handleUnStrike(w http.ResponseWriter, r *http.Request, g *GameState) {

	g.strikes = g.strikes - 1

	g.sendScreenUpdate()

	w.WriteHeader(http.StatusOK)

}

func handleJsonEdit(w http.ResponseWriter, r *http.Request, g *GameState) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		panic(err)
	}

	err = os.WriteFile("data/questions.json", body, 0644)
	if err != nil {
		fmt.Println(err)
	}

	err = os.WriteFile("data/backup.json", body, 0644)
	if err != nil {
		fmt.Println(err)
	}

	w.WriteHeader(http.StatusOK)
}
