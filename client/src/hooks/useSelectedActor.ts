import { useState } from 'react';
import { ACTORS, type Actor } from '../../../shared/task';

const storageKey = 'task-manager.actor';

function savedActor(): Actor {
  const value = window.localStorage.getItem(storageKey);
  return ACTORS.includes(value as Actor) ? (value as Actor) : ACTORS[0];
}

export function useSelectedActor() {
  const [actor, setActorState] = useState<Actor>(savedActor);

  function setActor(nextActor: Actor) {
    window.localStorage.setItem(storageKey, nextActor);
    setActorState(nextActor);
  }

  return [actor, setActor] as const;
}
