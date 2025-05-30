export const ClientLog = {
  NEW_LOG_LINE: 'clientlog:newlogline',
};

export const Sidekick = {
  CHECK_ITEM: 'sidekick:checkItem',
  INIT: 'sidekick:init',
  CONFIG: 'sidekick:config',
  SHOW: 'sidekick:showWindow',
  DEBUG: 'sidekick:debug',
};

export const Config = {
  SHOW_CONFIG_FILE: 'storage:showConfigFile',
  SHOW_CONFIG_WINDOW: 'configuration:showWindow',
};

export const LogProcessor = {
  RUN_TEST1: 'logprocessor:runtest1',
  NEW_BUYER: 'logprocessor:newBuyer',
  PLAYER_ARRIVAL: 'logprocessor:playerArrival',
  PLAYER_DEPARTURE: 'logprocessor:playerDeparture',
  EXCHANGE_ACCEPTED: 'logprocessor:exchangeAccepted',
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
