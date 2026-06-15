export const enUS = {
  locale: {
    english: 'English',
    spanish: 'Español'
  },
  gameMaster: {
    title: 'Game Master',
    subtitle: 'Admin controls for the realm.',
    storage: 'Local storage',
    clearStorage: 'Clear all saved data',
    clearConfirm: 'Erase all saved raffle data from this browser? The page will reload.',
    matchesUrl: 'Match data source',
    matchesUrlFull: 'Full',
    matchesUrlSlim: 'Slim',
    done: 'Done'
  },
  settings: {
    title: 'Settings',
    firstVisitTitle: 'Choose your tongue',
    firstVisitSubtitle: 'Pick a language for the realm. You can change this later.',
    language: 'Language',
    buildTime: 'Site build',
    done: 'Done',
    locale: {
      'en-US': 'English',
      'es-US': 'Español'
    }
  },
  app: {
    pageTitle: 'WC 2026 Raffle ⚔️',
    title: 'World Cup 2026 Raffle',
    live: 'LIVE'
  },
  status: {
    autoRefresh: 'Auto-refreshes every {seconds} seconds',
    refreshing: 'Refreshing…',
    lastUpdated: 'Last updated {time} · auto-refreshes every {seconds} s'
  },
  tabs: {
    leaderboard: '🏆 Leaderboard',
    raffle: '🎟 Raffle Draw',
    rankings: '📊 Power Rankings',
    rules: '📋 Rules',
    history: '📅 Daily History'
  },
  matchTabs: {
    recent: 'Recent',
    today: 'Today',
    tomorrow: 'Tomorrow'
  },
  matches: {
    title: '📅 Matches',
    showPrs: 'Show PRs',
    loading: 'Match data loading — check back shortly.',
    empty: 'No matches right now — check back soon!',
    matchupLegend: 'Raffle duel'
  },
  matchStatus: {
    ft: 'FT',
    live: '● LIVE',
    upcoming: 'UPCOMING'
  },
  leaderboard: {
    teams: '🏆 Teams ({count})',
    goals: '{count} goals'
  },
  groups: {
    g1: "🏆 Luis' Group",
    g2: "🏆 Gaby's Group"
  },
  pot: {
    title: "Winner's Hoard",
    chestAlt: 'Treasure chest',
    tagline: 'One champion. One chest. Winner take all.',
    entrants: '{count} entrants'
  },
  rules: {
    howToWin: '⚔️ How to Win',
    roundReachedTitle: 'Round Reached',
    roundReachedBody:
      "Whoever's team survives the longest wins outright. Champion takes the gold.",
    goalDiffTitle: 'Goal Difference',
    goalDiffBody:
      'Eliminated at the same stage? Best combined GD across every match (Groups + all Knockouts) wins.',
    goalsScoredTitle: 'Goals Scored',
    goalsScoredBody: 'Still tied? Most total goals scored across all matches breaks it.',
    coinTossTitle: '🎲 Coin Toss',
    coinTossBody:
      'If everything above is completely dead even, we flip a coin. Contact the organizer.',
    moversNotePrefix:
      'The ',
    moversHighlight: "Today's Movers",
    moversNoteSuffix:
      ' section only shows participants whose team actually played that day — so every movement you see is from real results, not from someone else\'s team losing.'
  },
  pr: {
    sourceLabel: '⚔ Power Ranking Source:',
    avgAll: 'Avg — All {count} Sources',
    rank: 'PR #{rank}',
    rankShort: 'PR'
  },
  progress: {
    notStarted: 'Not started',
    groupStage: 'Group Stage',
    roundOf32: 'Round of 32',
    roundOf16: 'Round of 16',
    quarterfinals: 'In Quarterfinals',
    r16Exit: 'R16 Exit',
    r32Exit: 'R32 Exit',
    inSemifinals: 'In Semifinals',
    qfExit: 'QF Exit',
    inFinal: 'In Final',
    thirdPlaceMatch: '3rd Place Match',
    champion: '🏆 Champion!',
    runnerUp: '🥈 Runner-Up',
    thirdPlace: '🥉 3rd Place',
    fourthPlace: '4th Place'
  },
  stage: {
    GROUP_STAGE: 'Group Stage',
    LAST_32: 'Round of 32',
    LAST_16: 'Round of 16',
    QUARTER_FINALS: 'Quarterfinals',
    SEMI_FINALS: 'Semifinals',
    THIRD_PLACE: '3rd Place',
    FINAL: 'Final'
  },
  dailySummary: {
    dayOne: 'DAY 1 — NO PRIOR RANKINGS TO COMPARE YET',
    noGames: 'NO GAMES TODAY YET',
    movers: "TODAY'S MOVERS ({since})",
    sinceYesterday: 'vs yesterday',
    sinceFirstLoad: 'since first load today'
  },
  history: {
    noHistory: 'No history saved yet.',
    savesDaily: 'The page saves a snapshot each day you visit.',
    checkTomorrow: 'Check back tomorrow!',
    noData: 'No data for this date.',
    matchesLoading: 'Match data still loading…',
    checkBack: 'Check back in a moment.',
    noTeamMatches: 'No matches involving your teams on this day.',
    recapTitle: '⚔ WC 2026 DAILY RECAP ⚔',
    positionChange: 'Position change',
    avgSources: 'Avg ({count} sources)',
    dayOneSnapshot: 'Day 1 — no prior snapshot',
    vsDate: 'vs {date}',
    player: 'PLAYER',
    move: 'MOVE',
    gdGoals: 'GD · GOALS',
    prRank: 'PR RANK'
  },
  rankings: {
    source:
      'Aggregated from 14 media outlets (ESPN, CBS, USAT, Yahoo, Guardian, Fox Sports, The Athletic, Bleacher Report, Elo, FIFA, Opta, Score, PrizePicks, Goal) ·',
    sourceLink: 'Source (Reddit r/soccer)',
    team: 'Team',
    avg: 'Avg'
  },
  picks: {
    pick: 'Pick #{num}'
  }
};

export type Messages = typeof enUS;
