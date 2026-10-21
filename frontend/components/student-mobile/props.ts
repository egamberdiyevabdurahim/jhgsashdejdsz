import type { BootPage } from '@/lib/boot'

/**
 * What src/server/pages.ts renderPage filled into web/student-mobile/shell.html, as props: the {{PLACEHOLDERS}} (startVars and the
 * identity), WHO_LINE (the line under the name: the design's "College applicant", a live student's own SB_ROLE), and the study clock
 * that public/d/student-mobile/js/001.js wrote into every [data-clock] after load (ported: computed here, rendered in place).
 */
export type ShellProps = {
  ME_FULL: string; ME_FIRST: string
  PROGRAM_DAYS: string; STUDY_DAY: string; DAY_PROGRESS: string; COINS: string; DAY_REWARD: string; TASKS_TOTAL: string; TASKS_COMPLETED: string
  IQ_BEST: string; IQ_BEST_TEXT: string; GOAL_TITLE: string; GOAL_ARIA: string; APPS_NAMES: string; DOME_ARIA: string
  SB_ROLE: string; TB_SUB: string   // the laptop's sidebar role line and the top bar's line under the name
  WHO_LINE: string
  clock: { left: number; day: number; total: number }
  /** the score arc's start (002.js + jg-runtime.js section 9, ported into components/student-mobile/ported/ScoreArc.tsx) */
  live: boolean
  photo: string
}

/** Every region component's props (components/<app>/gen/*.tsx, ported/*.tsx) */
export type RegionProps = { p: ShellProps; clock: ShellProps['clock'] }

/** 001.js: the program's length and today's study day, clamped as the design clamps them */
export function studyClock(programDays: string, studyDay: string) {
  const total = parseInt(programDays, 10) || 390
  const day = Math.min(total, Math.max(1, parseInt(studyDay, 10) || 1))
  return { left: total - day + 1, day, total }
}

/** jg-runtime.js face(): the photo the design shows, the account's own or its initials (src/server/initials.ts via boot.me) */
export function shellProps(d: BootPage, photo: string): ShellProps {
  const s = d.start, live = !!d.boot.engine
  return {
    ME_FULL: d.boot.me.fullName, ME_FIRST: d.boot.me.firstName,
    PROGRAM_DAYS: s.PROGRAM_DAYS!, STUDY_DAY: s.STUDY_DAY!, DAY_PROGRESS: s.DAY_PROGRESS!, COINS: s.COINS!, DAY_REWARD: s.DAY_REWARD!,
    TASKS_TOTAL: s.TASKS_TOTAL!, TASKS_COMPLETED: s.TASKS_COMPLETED!, IQ_BEST: s.IQ_BEST!, IQ_BEST_TEXT: s.IQ_BEST_TEXT!,
    GOAL_TITLE: s.GOAL_TITLE!, GOAL_ARIA: s.GOAL_ARIA!, APPS_NAMES: s.APPS_NAMES!, DOME_ARIA: s.DOME_ARIA!, SB_ROLE: s.SB_ROLE!, TB_SUB: s.TB_SUB!,
    WHO_LINE: live ? s.SB_ROLE! : 'College applicant',
    clock: studyClock(s.PROGRAM_DAYS!, s.STUDY_DAY!),
    live: live && !d.boot.demo, photo,
  }
}
