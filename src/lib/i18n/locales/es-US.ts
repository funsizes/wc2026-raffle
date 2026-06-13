import type { Messages } from './en-US';

export const esUS: Messages = {
  locale: {
    promptTitle: 'Elige tu idioma',
    promptSubtitle: 'Escoge un idioma para el reino. Podrás cambiarlo después.',
    english: 'English',
    spanish: 'Español'
  },
  app: {
    pageTitle: 'Sorteo WC 2026 ⚔️',
    title: 'Sorteo Copa Mundial 2026',
    live: '● EN VIVO'
  },
  status: {
    autoRefresh: 'Se actualiza cada 90 segundos',
    refreshing: 'Actualizando…',
    lastUpdated: 'Última actualización {time} · se actualiza cada 90 s'
  },
  tabs: {
    leaderboard: '🏆 Clasificación',
    raffle: '🎟 Sorteo',
    rankings: '📊 Power Rankings',
    rules: '📋 Reglas',
    history: '📅 Historial diario'
  },
  matchTabs: {
    recent: 'Recientes',
    today: 'Hoy',
    tomorrow: 'Mañana'
  },
  matches: {
    title: '📅 Partidos',
    showPrs: 'Mostrar PR',
    loading: 'Cargando partidos — vuelve pronto.',
    empty: 'No hay partidos ahora — ¡vuelve pronto!'
  },
  matchStatus: {
    ft: 'FT',
    live: '● EN VIVO',
    upcoming: 'PRÓXIMO'
  },
  leaderboard: {
    teams: '🏆 Equipos ({count})',
    goals: '{count} goles'
  },
  groups: {
    g1: '🏆 Grupo Luis',
    g2: '🏆 Grupo Gaby'
  },
  pot: {
    title: 'Tesoro del ganador',
    chestAlt: 'Cofre del tesoro',
    tagline: 'Un campeón. Un cofre. Ganador se lo lleva todo.',
    entrants: '{count} participantes'
  },
  rules: {
    howToWin: '⚔️ Cómo ganar',
    roundReachedTitle: 'Ronda alcanzada',
    roundReachedBody:
      'Gana quien sobreviva más rondas. El campeón se lleva el oro.',
    goalDiffTitle: 'Diferencia de goles',
    goalDiffBody:
      '¿Eliminados en la misma ronda? Gana la mejor diferencia de goles combinada en todos los partidos (grupos + eliminatorias).',
    goalsScoredTitle: 'Goles anotados',
    goalsScoredBody:
      '¿Siguen empatados? Gana quien haya anotado más goles en total.',
    coinTossTitle: '🎲 Sorteo de moneda',
    coinTossBody:
      'Si todo lo anterior queda completamente empatado, lanzamos una moneda. Contacta al organizador.',
    moversNotePrefix:
      'La sección ',
    moversHighlight: 'Movimientos de hoy',
    moversNoteSuffix:
      ' solo muestra participantes cuyo equipo jugó ese día — cada movimiento refleja resultados reales, no la derrota del equipo de otro.'
  },
  pr: {
    sourceLabel: '⚔ Fuente de Power Ranking:',
    avgAll: 'Prom — {count} fuentes',
    rank: 'PR #{rank}',
    rankShort: 'PR'
  },
  progress: {
    notStarted: 'Sin empezar',
    groupStage: 'Fase de grupos',
    roundOf32: 'Dieciseisavos',
    roundOf16: 'Octavos de final',
    quarterfinals: 'En cuartos',
    r16Exit: 'Eliminado en octavos',
    r32Exit: 'Eliminado en dieciseisavos',
    inSemifinals: 'En semifinales',
    qfExit: 'Eliminado en cuartos',
    inFinal: 'En la final',
    thirdPlaceMatch: 'Partido por el 3.er puesto',
    champion: '🏆 ¡Campeón!',
    runnerUp: '🥈 Subcampeón',
    thirdPlace: '🥉 3.er puesto',
    fourthPlace: '4.º puesto'
  },
  stage: {
    GROUP_STAGE: 'Fase de grupos',
    LAST_32: 'Dieciseisavos',
    LAST_16: 'Octavos de final',
    QUARTER_FINALS: 'Cuartos de final',
    SEMI_FINALS: 'Semifinales',
    THIRD_PLACE: '3.er puesto',
    FINAL: 'Final'
  },
  dailySummary: {
    dayOne: 'DÍA 1 — AÚN NO HAY CLASIFICACIÓN PREVIA',
    noGames: 'AÚN NO HAY PARTIDOS HOY',
    movers: 'MOVIMIENTOS DE HOY ({since})',
    sinceYesterday: 'vs ayer',
    sinceFirstLoad: 'desde la primera carga de hoy'
  },
  history: {
    noHistory: 'Aún no hay historial guardado.',
    savesDaily: 'La página guarda una instantánea cada día que la visitas.',
    checkTomorrow: '¡Vuelve mañana!',
    noData: 'No hay datos para esta fecha.',
    matchesLoading: 'Los partidos aún se están cargando…',
    checkBack: 'Vuelve en un momento.',
    noTeamMatches: 'No hubo partidos con tus equipos este día.',
    recapTitle: '⚔ RESUMEN DIARIO WC 2026 ⚔',
    positionChange: 'Cambio de posición',
    avgSources: 'Prom ({count} fuentes)',
    dayOneSnapshot: 'Día 1 — sin instantánea previa',
    vsDate: 'vs {date}',
    player: 'JUGADOR',
    move: 'MOV',
    gdGoals: 'DG · GOLES',
    prRank: 'RANK PR'
  },
  rankings: {
    source:
      'Agregado de 14 medios (ESPN, CBS, USAT, Yahoo, Guardian, Fox Sports, The Athletic, Bleacher Report, Elo, FIFA, Opta, Score, PrizePicks, Goal) ·',
    sourceLink: 'Fuente (Reddit r/soccer)',
    team: 'Equipo',
    avg: 'Prom'
  },
  picks: {
    pick: 'Pick #{num}'
  }
};
