// PORTED from gen/R06Screen.tsx (web/student-mobile/shell.html region 6, Home: profile, roadmap, Today's dome). Hand-edited:
// the photo + score arc (002.js) are <ScoreArc>, the [data-clock] values (001.js) are rendered. Re-generating gen/ leaves this file alone.
import type { ShellProps } from '../props'
import ScoreArc from './ScoreArc'

export default function R06Screen({ p, clock }: { p: ShellProps; clock: ShellProps['clock'] }) {
  return (
    <div className="screen" data-program-days={`${p.PROGRAM_DAYS}`} data-day={`${p.STUDY_DAY}`}>
      {"\n  "}
      <section className="profile" aria-label="Student profile">
        {"\n\n    "}
        <svg className="bowl" viewBox="0 0 375 260" preserveAspectRatio="none" aria-hidden="true">
          {"\n      "}
          <defs>
            {"\n        "}
            <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
              {"\n          "}
              <stop offset="0" stopColor="#0f3323"></stop>
              {"\n          "}
              <stop offset="1" stopColor="#19553c"></stop>
              {"\n        "}
            </linearGradient>
            {"\n      "}
          </defs>
          {"\n      "}
          <path d="M0 0H375V168Q187.5 336 0 168Z" fill="url(#g)"></path>
          {"\n    "}
        </svg>
        {"\n\n    "}
        <header className="who">
          {"\n      "}
          <div>
            {"\n        "}
            <h1>
              {`
          ${p.ME_FULL}
          `}
              <svg viewBox="0 0 24 24" fill="none" stroke="#7cd0a8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {"\n            "}
                <path d="M2 9l10-5 10 5-10 5L2 9z"></path>
                <path d="M6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5"></path>
                <path d="M22 9v6"></path>
                {"\n          "}
              </svg>
              {"\n        "}
            </h1>
            {"\n        "}
            <p>{p.WHO_LINE}</p>
            {"\n        "}
            <button className="plan-chip" id="plan-chip" type="button">✦ Upgrade</button>
            {"\n      "}
          </div>
          {"\n      "}
          <button className="bell-btn" id="bell-btn" type="button" aria-label="Notifications">
            <svg viewBox="0 0 24 24">
              <path d="M6.5 16.5V11a5.5 5.5 0 0 1 11 0v5.5l1.5 2h-14z"></path>
              <path d="M10 20.5a2.2 2.2 0 0 0 4 0"></path>
            </svg>
            <span className="bell-n" id="bell-n" hidden>0</span>
          </button>
          {"\n    "}
        </header>
        {"\n\n    "}
        <ScoreArc live={p.live} photo={p.photo} meFull={p.ME_FULL} />
        {"\n  "}
      </section>
      {"\n\n    "}
      <section className="rm" id="rm" aria-labelledby="rm-title">
        {"\n      "}
        <header className="rm-head">
          {"\n        "}
          <span className="rm-ico" aria-hidden="true">
            {"\n          "}
            <svg viewBox="0 0 24 24">
              <path d="M22 7l-8.5 8.5-5-5L2 17"></path>
              <path d="M16 7h6v6"></path>
            </svg>
            {"\n        "}
          </span>
          {"\n        "}
          <div className="rm-title">
            {"\n          "}
            <h2 id="rm-title">{`Roadmap to ${p.GOAL_TITLE}`}</h2>
            {"\n          "}
            <p className="rm-sub" id="rm-sub">Your predicted path</p>
            {"\n        "}
          </div>
          {"\n        "}
          <span className="rm-left rm-ready" id="rm-ready" role="img" aria-label="1% ready for university">
            {"\n          "}
            <span className="rm-left-n">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M2.5 9.4L12 5l9.5 4.4L12 13.8z"></path>
                <path d="M6.4 11.3v4.4c0 1.6 2.5 2.9 5.6 2.9s5.6-1.3 5.6-2.9v-4.4"></path>
              </svg>
              <span id="rm-ready-n">1%</span>
            </span>
            {"\n          "}
            <span className="rm-left-u">ready</span>
            {"\n        "}
          </span>
          {"\n        "}
          <button className="eye" id="eye" type="button" aria-expanded="false" aria-controls="rm-body" aria-label="Show roadmap">
            {"\n          "}
            <svg className="on" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            {"\n          "}
            <svg className="off" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M17.9 17.9A10.1 10.1 0 0 1 12 19C5.6 19 2 12 2 12a18.5 18.5 0 0 1 5.1-5.9M9.9 5.1A9.7 9.7 0 0 1 12 5c6.4 0 10 7 10 7a18.6 18.6 0 0 1-2.2 3.2"></path>
              <path d="M14.1 14.1a3 3 0 1 1-4.2-4.2"></path>
              <path d="M2 2l20 20"></path>
            </svg>
            {"\n        "}
          </button>
          {"\n      "}
        </header>
        {"\n\n\n      "}
        <div className="rm-body" id="rm-body">
          {"\n        "}
          <div className="rm-inner">
            {"\n          "}
            <div className="legend">
              {"\n            "}
              <span>
                <i></i>
                Predicted path
              </span>
              {"\n            "}
              <span id="lg-act" className="off">
                <i className="solid"></i>
                Your progress
              </span>
              {"\n          "}
            </div>
            {"\n          "}
            <div className="chart">
              {"\n            "}
              <svg id="chart" viewBox="0 0 300 268" role="img" aria-label={`${p.GOAL_ARIA}`}></svg>
              {"\n          "}
            </div>
            {"\n          "}
            <div className="rm-goal" aria-live="polite">
              <img id="rm-goal-img" alt="" />
              <p id="rm-goal-txt"></p>
            </div>
            {"\n          "}
            <button className="rm-apps" id="rm-apps" type="button">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 3.5h7l4 4v13H7z"></path>
                <path d="M14 3.5v4h4M10 12h5M10 16h5"></path>
              </svg>
              <span>
                My applications
                <small id="rm-apps-names">{` · ${p.APPS_NAMES}`}</small>
              </span>
              ›
            </button>
            {"\n          "}
            <details className="rm-credits">
              <summary>Photo credits</summary>
              <p id="rm-credits-list"></p>
            </details>
            {"\n        "}
          </div>
          {"\n      "}
        </div>
        {"\n    "}
      </section>
      {"\n\n    \n    "}
      <section className="wd" id="world" data-progress={`${p.DAY_PROGRESS}`} data-coins={`${p.COINS}`} data-reward={`${p.DAY_REWARD}`} aria-labelledby="wd-title">
        {"\n      "}
        <header className="wd-head">
          {"\n        "}
          <span className="wd-ico" aria-hidden="true">
            {"\n          "}
            <svg viewBox="0 0 24 24">
              <path d="M3.5 20.5h17M5.5 20.5v-6.5h13v6.5M8 14v6.5M10.7 14v6.5M13.3 14v6.5M16 14v6.5M6.5 14Q7 6.5 12 6.5T17.5 14M12 6.5V3.8"></path>
            </svg>
            {"\n        "}
          </span>
          {"\n        "}
          <div className="wd-title">
            {"\n          "}
            <h2 id="wd-title">Today</h2>
            {"\n          "}
            <p className="wd-sub" id="wd-sub">0% complete</p>
            {"\n        "}
          </div>
          {"\n        "}
          <div className="wd-day">
            {"\n          "}
            <p className="wd-day-n" aria-hidden="true">
              <b data-clock="day">{clock.day}</b>
              <span>
                /
                <span data-clock="total">{clock.total}</span>
              </span>
            </p>
            {"\n          "}
            <p className="wd-day-l">
              Study day
              <span className="sr-only">
                {" "}
                <span data-clock="day">{clock.day}</span>
                {" of "}
                <span data-clock="total">{clock.total}</span>
              </span>
            </p>
            {"\n        "}
          </div>
          {"\n      "}
        </header>
        {"\n\n      "}
        <div className="wd-scene">
          {"\n        "}
          <svg id="wd-svg" viewBox="0 0 340 226" role="img" aria-label={`${p.DOME_ARIA}`}></svg>
          {"\n        \n      "}
        </div>
        {"\n\n      "}
        <ol className="wd-tasks" id="wd-tasks" aria-label="Today's tasks"></ol>
        {"\n\n      "}
        <p className="wd-stake" id="wd-stake">
          {"\n        "}
          <svg className="st-lock" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="5" y="11" width="14" height="10" rx="2.5"></rect>
            <path d="M8 11V8a4 4 0 0 1 8 0v3"></path>
          </svg>
          {"\n        "}
          <svg className="st-open" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="5" y="11" width="14" height="10" rx="2.5"></rect>
            <path d="M8 11V8a4 4 0 0 1 7.6-1.8"></path>
          </svg>
          {"\n        "}
          <span className="wd-stake-txt" id="wd-stake-txt">Break the chains at 100%</span>
          {"\n        "}
          <span className="wd-prize">
            <span className="coin" aria-hidden="true"></span>
            <span id="wd-prize">+40</span>
          </span>
          {"\n        "}
          <button className="wd-read" id="wd-read" type="button">
            Read letter
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg>
          </button>
          {"\n      "}
        </p>
        {"\n\n    "}
      </section>
      {"\n  "}
    </div>
  )
}
