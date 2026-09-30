// ATENEO — pool intermedio (100): mismo reparto por categorías que el avanzado
import { iart } from "./art";
import { ihistory } from "./history";
import { ifilosophy } from "./philosophy";
import { ichemistry } from "./chemistry";
import { imaths } from "./maths";

export const INTERMEDIO = [...iart, ...ihistory, ...ifilosophy, ...ichemistry, ...imaths];
