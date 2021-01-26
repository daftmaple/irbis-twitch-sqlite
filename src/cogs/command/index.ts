import { CommandFunction } from '../../types/handler';
import { time } from './time';
import { uptime } from './uptime';
import { followage } from './followage';
import { song } from './song';
import { addcom } from './addcom';
import { delcom } from './delcom';
import { vanish } from './vanish';

export const commandMap: Map<string, CommandFunction> = new Map(
  Object.entries({
    time: time,
    uptime: uptime,
    followage: followage,
    song: song,
    addcom: addcom,
    delcom: delcom,
    vanish: vanish,
  })
);

export const commands = Array.from(commandMap.keys());
