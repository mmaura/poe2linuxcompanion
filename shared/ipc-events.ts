export const ClientLog = {
  NEW_LOG_LINE: 'clientlog:newlogline',
};

export const Sidekick = {
  CHECK_ITEM: 'sidekick:checkItem',
  CONFIG: 'sidekick:config',
};

export const LogProcessor = {
  RUN_TEST1: 'logprocessor:runtest1',
  NEW_BUYER: 'logprocessor:newBuyer',
  PLAYER_ARRIVAL: 'logprocessor:playerArrival',
  PLAYER_DEPARTURE: 'logprocessor:playerDeparture',
  WISP: 'logprocessor:wisp',
};

export const Commerce = {
  SET_WINDOW_HEIGHT: 'commerce:setWindowHeight',
  PUSH_BUYER: 'commerce:pushBuyer',
  UPDATE_BUYER: 'commerce:updateBuyer',
  SPLICE_BUYER: 'commerce:spliceBuyer',
  BUYER_NEXT_ACTION: 'commerce:buyerNextAction',
  LAST_WISPER_WAIT: 'commerce:lasWisperWait',
};

export const GameCommands = {
  INVITE: 'gamecmd:invite',
  TRADE: 'gamecmd:trade',
  SAY_THX: 'gamecmd:sayThx',
  KICK: 'gamecmd:kick',
  SAY_WAIT: 'gamecmd:sayWait',
  TO_PLAYER_HIDEOUT: 'gamecmd:toPayerHideout',
  HIDEOUT: 'gamecmd:hideout',
};
