import { useParams } from "react-router-dom";
import React from "react";
import { RoundPhase, GameType, Team } from "../state/AppState";
import { GiveClue } from "./GiveClue";
import { MakeGuess } from "./MakeGuess";
import { ViewScore } from "./ViewScore";
import { useStorageBackedState } from "./useStorageBackedState";
import { useNetworkBackedGameState } from "./useNetworkBackedGameState";
import { InputName } from "./InputName";
import { JoinTeam } from "./JoinTeam";
import { NewRound } from "../state/NewRound";
import { ScoreRound } from "../state/ScoreForPlayerTeam";
import { Scoreboard } from "./Scoreboard";
import { RandomSpectrumCard } from "../state/SpectrumCards";
import { RandomSpectrumTarget } from "../state/RandomSpectrumTarget";
import { RandomFourCharacterString } from "../state/RandomFourCharacterString";
import { SetupGame } from "./SetupGame";
import { NewTeamGame } from "../state/NewGame";
import { CounterGuess } from "./CounterGuess";

export function GameRoom() {
  const { roomId } = useParams();
  if (roomId === undefined) {
    throw new Error("RoomId missing");
  }

  const [playerName, setPlayerName] = useStorageBackedState("", "name");
  const [playerId] = useStorageBackedState(
    RandomFourCharacterString(),
    "playerId"
  );

  const [gameState, setGameState] = useNetworkBackedGameState(
    roomId,
    playerId,
    playerName
  );

  if (playerName.length === 0) {
    return <InputName setName={setPlayerName} />;
  }

  if (!gameState?.players?.[playerId]) {
    return null;
  }

  const playerTeam = gameState.players[playerId].team;

  if (gameState.roundPhase === RoundPhase.SetupGame) {
    return (
      <SetupGame
        startGame={(gameType) => {
          if (gameType === GameType.Teams) {
            setGameState({
              roundPhase: RoundPhase.PickTeams,
              gameType,
            });
          }
          setGameState({
            ...NewRound(playerId),
            gameType,
          });
        }}
      />
    );
  }

  if (
    gameState.gameType === GameType.Teams &&
    (gameState.roundPhase === RoundPhase.PickTeams || playerTeam === Team.Unset)
  ) {
    return (
      <JoinTeam
        {...gameState}
        joinTeam={(team) => {
          setGameState({
            players: {
              ...gameState.players,
              [playerId]: {
                name: playerName,
                team,
              },
            },
          });
        }}
        startGame={() => {
          setGameState(NewTeamGame(gameState.players, playerId));
        }}
      />
    );
  }

  return (
    <>
      {gameState.roundPhase === RoundPhase.GiveClue && (
        <GiveClue
          {...gameState}
          playerId={playerId}
          updateClueGiver={(playerId: string) => {
            setGameState({
              clueGiver: playerId,
            });
          }}
          redrawCard={() => {
            setGameState({
              spectrumCard: RandomSpectrumCard(),
              spectrumTarget: RandomSpectrumTarget(),
            });
          }}
          submitClue={(clue) => {
            setGameState({
              clue,
              guess: 0,
              roundPhase: RoundPhase.MakeGuess,
            });
          }}
        />
      )}
      {gameState.roundPhase === RoundPhase.MakeGuess && (
        <MakeGuess
          {...gameState}
          playerId={playerId}
          setGuess={(guess: number) => {
            setGameState({
              guess,
            });
          }}
          submitGuess={() => {
            if (gameState.gameType === GameType.Teams) {
              setGameState({
                roundPhase: RoundPhase.CounterGuess,
              });
            } else {
              setGameState({
                roundPhase: RoundPhase.ViewScore,
              });
            }
          }}
        />
      )}
      {gameState.roundPhase === RoundPhase.CounterGuess && (
        <CounterGuess
          {...gameState}
          playerId={playerId}
          guessLeft={() => {
            setGameState(ScoreRound(gameState, playerId, "left"));
          }}
          guessRight={() => {
            setGameState(ScoreRound(gameState, playerId, "right"));
          }}
        />
      )}
      {gameState.roundPhase === RoundPhase.ViewScore && (
        <ViewScore
          gameState={gameState}
          playerId={playerId}
          nextRound={() => setGameState(NewRound(playerId))}
        />
      )}
      <Scoreboard
        {...gameState}
        removePlayer={(playerId) => {
          delete gameState.players[playerId];
          setGameState(gameState);
        }}
      />
    </>
  );
}
