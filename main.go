package main

import (
	"encoding/json"
	"flag"
	"io"
	"net/http"
	"os"
	"slices"

	"github.com/dustin/go-broadcast"
	"github.com/gorilla/websocket"
)

func getQuestions() Questions {

	url := "data/questions.json"

	jsonFile, err := os.Open(url)
	if err != nil {
		return Questions{}
	}

	defer jsonFile.Close()

	byteValue, _ := io.ReadAll(jsonFile)

	var questions Questions

	json.Unmarshal(byteValue, &questions)

	return questions
}

type GameState struct {
	questions Questions
	current   Question
	uncovered []int
	guessed   []int
	round     uint8
	team      uint8
	strikes   uint8

	leftPoint  uint16
	rightPoint uint16

	lastFrame Game

	screenUpdateChannel broadcast.Broadcaster
	buttonChannel       broadcast.Broadcaster
}

func (state *GameState) reset() {
	questions := getQuestions()
	state.questions = questions
	state.current = Question{}
	state.uncovered = []int{}
	state.guessed = []int{}
	state.round = 0
	state.team = 0
	state.strikes = 0
	state.leftPoint = 0
	state.rightPoint = 0
	state.lastFrame = Game{}

	state.newRound()
}

func (g *GameState) calculateSum() uint16 {
	var sum uint16 = 0

	length := len(g.current.Options)

	i := 0

	for i < length {
		if slices.Contains(g.guessed, i) {
			sum = sum + g.current.Options[i].Points
		}
		i = i + 1
	}

	return sum
}

func (g *GameState) newRound() {

	if g.team == 1 {
		if g.strikes < 3 || g.strikes > 3 {
			g.leftPoint = g.leftPoint + g.calculateSum()
		} else {
			g.rightPoint = g.rightPoint + g.calculateSum()
		}
	} else if g.team == 2 {
		if g.strikes < 3 || g.strikes > 3 {
			g.rightPoint = g.rightPoint + g.calculateSum()
		} else {
			g.leftPoint = g.leftPoint + g.calculateSum()
		}
	}

	g.current = g.questions.getRandom()
	g.uncovered = []int{}
	g.guessed = []int{}
	g.round = g.round + 1
	g.team = 0
	g.strikes = 0

	screen := g.buildScreen()
	g.lastFrame = screen
}

func (h *GameState) buildFuncHandler(f func(w http.ResponseWriter, r *http.Request, l *GameState)) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		f(w, r, h)
	}
}

var addr = flag.String("addr", "0.0.0.0:8080", "http service address")

var upgrader = websocket.Upgrader{}

/*
/screen/
/api/v1/screen/ws

/server/
/api/v1/server/ws
/api/v1/server/uncover?id=0
/api/v1/server/play?team=1
/api/v1/server/next

/button/
/api/v1/button/TEAM
*/

func main() {

	questions := getQuestions()

	state := GameState{questions, Question{}, []int{}, []int{}, 0, 0, 0, 0, 0, Game{}, broadcast.NewBroadcaster(3), broadcast.NewBroadcaster(3)}

	state.newRound()

	flag.Parse()
	http.HandleFunc("/api/v1/screen/ws", state.buildFuncHandler(handleScreenWS))
	http.HandleFunc("/api/v1/screen/state", state.buildFuncHandler(handleScreenState))

	http.HandleFunc("/api/v1/server/ws", state.buildFuncHandler(handleServerWS))
	http.HandleFunc("/api/v1/server/reset", state.buildFuncHandler(handleReset))
	http.HandleFunc("/api/v1/server/uncover", state.buildFuncHandler(handleUncover))
	http.HandleFunc("/api/v1/server/show", state.buildFuncHandler(handleShow))
	http.HandleFunc("/api/v1/server/play", state.buildFuncHandler(handlePlay))
	http.HandleFunc("/api/v1/server/next", state.buildFuncHandler(handleNext))
	http.HandleFunc("/api/v1/server/button", state.buildFuncHandler(handleButton))
	http.HandleFunc("/api/v1/server/strike", state.buildFuncHandler(handleStrike))
	http.HandleFunc("/api/v1/server/unstrike", state.buildFuncHandler(handleUnStrike))
	http.HandleFunc("/api/v1/server/setpoints", state.buildFuncHandler(handleSetPoint))
	http.HandleFunc("/api/v1/server/save", state.buildFuncHandler(handleJsonEdit))
	http.HandleFunc("/api/v1/server/json", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "data/questions.json")
	})

	http.HandleFunc("/screen", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "static/screen.html")
	})

	http.HandleFunc("/button", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "static/button.html")
	})

	http.HandleFunc("/server", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "static/server.html")
	})

	http.HandleFunc("/edit", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "static/edit.html")
	})

	http.Handle("/", http.FileServer(http.Dir("static/")))

	defer state.screenUpdateChannel.Close()
	defer state.buttonChannel.Close()

	http.ListenAndServe(*addr, nil)

}
