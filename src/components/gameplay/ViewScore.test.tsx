import React from "react";
import { render } from "@testing-library/react";
import { I18nextProvider } from 'react-i18next';
import { ViewScore } from "./ViewScore";
import { InitialGameState, Team, GameState } from "../../state/GameState";
import { BuildGameModel } from "../../state/BuildGameModel";
import { GameModelContext } from "../../state/GameModelContext";
import i18n from '../../i18nForTests';

const onePlayerGame: GameState = {
  ...InitialGameState(),
  players: {
    playerId: {
      name: "Player",
      team: Team.Left,
    },
  },
  clueGiver: "playerId",
};

test("Applies 4 points for a perfect guess", () => {
  const gameState = {
    ...onePlayerGame,
    spectrumTarget: 1,
    guess: 1,
  };

  const component = render(
    <GameModelContext.Provider
      value={BuildGameModel(gameState, jest.fn(), "playerId")}
    >
      <I18nextProvider i18n={i18n}>
        <ViewScore />
      </I18nextProvider>
    </GameModelContext.Provider>
  );

  const subject = component.getByText(/Score:/);
  expect(subject).toHaveTextContent("4 POINTS!")
  expect(subject).toBeInTheDocument();
});

test("Applies 2 points for off by 2", () => {
  const gameState = {
    ...onePlayerGame,
    spectrumTarget: 1,
    guess: 3,
  };

  const component = render(
    <GameModelContext.Provider
      value={BuildGameModel(gameState, jest.fn(), "playerId")}
    >
      <I18nextProvider i18n={i18n}>
        <ViewScore />
      </I18nextProvider>
    </GameModelContext.Provider>
  );

  const subject = component.getByText(/Score:/);
  expect(subject).toHaveTextContent("2 POINTS!")
  expect(subject).toBeInTheDocument();
});

test("Applies 0 points for off by 3", () => {
  const gameState = {
    ...onePlayerGame,
    spectrumTarget: 1,
    guess: 4,
  };

  const component = render(
    <GameModelContext.Provider
      value={BuildGameModel(gameState, jest.fn(), "playerId")}
    >
      <I18nextProvider i18n={i18n}>
        <ViewScore />
      </I18nextProvider>
    </GameModelContext.Provider>
  );
  
  const subject = component.getByText(/Score:/);
  expect(subject).toHaveTextContent("0 POINTS!")
  expect(subject).toBeInTheDocument();
});

test("Includes the score for a correct counter guess", () => {
  const gameState: GameState = {
    ...onePlayerGame,
    spectrumTarget: 1,
    guess: 3,
    counterGuess: "left",
  };
  
  const component = render(
    <GameModelContext.Provider
    value={BuildGameModel(gameState, jest.fn(), "playerId")}
    >
      <I18nextProvider i18n={i18n}>
        <ViewScore />
      </I18nextProvider>
    </GameModelContext.Provider>
  );
  
  const subject = component.getByText(/RIGHT BRAIN/);
  expect(subject).toHaveTextContent("gets 1 point for their correct counter guess.")
  expect(subject).toBeInTheDocument();
});

test("Includes the score for a wrong counter guess", () => {
  const gameState: GameState = {
    ...onePlayerGame,
    spectrumTarget: 1,
    guess: 3,
    counterGuess: "right",
  };

  const component = render(
    <GameModelContext.Provider
      value={BuildGameModel(gameState, jest.fn(), "playerId")}
    >
      <I18nextProvider i18n={i18n}>
        <ViewScore />
      </I18nextProvider>
    </GameModelContext.Provider>
  );

  const subject = component.getByText(
    "RIGHT BRAIN gets 0 points for their counter guess."
  );
  expect(subject).toBeInTheDocument();
});

test("Applies catchup rule", () => {
  const gameState = {
    ...onePlayerGame,
    rightScore: 4,
    spectrumTarget: 1,
    guess: 1,
  };

  const component = render(
    <GameModelContext.Provider
      value={BuildGameModel(gameState, jest.fn(), "playerId")}
    >
      <I18nextProvider i18n={i18n}>
        <ViewScore />
      </I18nextProvider>
    </GameModelContext.Provider>
  );

  const subject = component.getByText(
    "Catchup activated: LEFT BRAIN takes a bonus turn!"
  );
  expect(subject).toBeInTheDocument();
});

test("Ends game when one team has 10 points", () => {
  const gameState = {
    ...onePlayerGame,
    leftScore: 10,
  };

  const component = render(
    <GameModelContext.Provider
      value={BuildGameModel(gameState, jest.fn(), "playerId")}
    >
      <I18nextProvider i18n={i18n}>
        <ViewScore />
      </I18nextProvider>
    </GameModelContext.Provider>
  );

  const subject = component.getByText("LEFT BRAIN wins!");
  expect(subject).toBeInTheDocument();
});

test("Does not end game when both teams have 10 points", () => {
  const gameState = {
    ...onePlayerGame,
    leftScore: 10,
    rightScore: 10,
  };

  const component = render(
    <GameModelContext.Provider
      value={BuildGameModel(gameState, jest.fn(), "playerId")}
    >
      <I18nextProvider i18n={i18n}>
        <ViewScore />
      </I18nextProvider>
    </GameModelContext.Provider>
  );

  const subject = component.queryByText("LEFT BRAIN wins!");
  expect(subject).toBeNull();
});
