package main

import (
	"cmp"
	"math/rand"
	"slices"
)

type Answear struct {
	Text   string `json:"text"`
	Points uint16 `json:"points"`
}

type Question struct {
	Question string    `json:"question"`
	Options  []Answear `json:"options"`
}

func (q *Question) sortOptions() {
	slices.SortFunc(q.Options, func(a, b Answear) int {
		return cmp.Compare(b.Points, a.Points)
	})
}

type ScreenLine struct {
	Text    string `json:"text"`
	Points  uint16 `json:"points"`
	Guessed bool   `json:"guessed"`
	Shown   bool   `json:"shown"`
}

type Game struct {
	Lines      []ScreenLine `json:"lines"`
	Sum        int          `json:"sum"`
	Team       int          `json:"team"`
	Strikes    int          `json:"strikes"`
	LeftPoint  int          `json:"left_points"`
	RightPoint int          `json:"right_points"`
	Question   string       `json:"question"`
}

type Questions struct {
	Questions []Question `json:"questions"`
}

type Button struct {
	Team int `json:"team"`
}

func (q *Questions) getRandom() Question {
	question := q.Questions[rand.Intn(len(q.Questions))]
	question.sortOptions()
	return question
}
