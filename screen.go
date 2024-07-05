package main

import (
	"encoding/json"
	"net/http"
	"slices"

	"github.com/gorilla/websocket"
)

func (g *GameState) buildScreen() Game {
	return g.buildScreenWithEvent("")
}

func (g *GameState) buildScreenWithEvent(event string) Game {
	screen := Game{}

	var i int = 0

	length := len(g.current.Options)

	for i < length {
		screen.Lines = append(screen.Lines, ScreenLine{g.current.Options[i].Text, g.current.Options[i].Points, slices.Contains(g.guessed, i), slices.Contains(g.uncovered, i)})
		i = i + 1
	}

	screen.Sum = int(g.calculateSum())

	screen.Team = int(g.team)

	screen.Strikes = int(g.strikes)

	screen.LeftPoint = int(g.leftPoint)

	screen.RightPoint = int(g.rightPoint)

	screen.Question = g.current.Question

	screen.Event = event

	return screen
}

func (g *GameState) sendScreenUpdate() {
	g.sendScreenUpdateWithEvent("")
}

func (g *GameState) sendScreenUpdateWithEvent(event string) {
	screen := g.buildScreenWithEvent(event)
	g.lastFrame = screen
	g.screenUpdateChannel.Submit(screen)
}

func handleScreenWS(w http.ResponseWriter, r *http.Request, g *GameState) {
	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}
	defer c.Close()

	ch := make(chan interface{})

	g.screenUpdateChannel.Register(ch)

	defer g.screenUpdateChannel.Unregister(ch)

	res, err := json.Marshal(g.lastFrame)
	if err != nil {
		return
	}

	err = c.WriteMessage(websocket.TextMessage, res)
	if err != nil {
		return
	}

	for screen := range ch {

		res, err := json.Marshal(screen)
		if err != nil {
			break
		}

		err = c.WriteMessage(websocket.TextMessage, res)
		if err != nil {
			break
		}
	}
}

func handleScreenState(w http.ResponseWriter, r *http.Request, g *GameState) {
	res, err := json.Marshal(g.lastFrame)
	if err != nil {
		return
	}

	w.Write(res)
}
