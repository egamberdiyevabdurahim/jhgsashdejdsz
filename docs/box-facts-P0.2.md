# P0.2 box facts (read-only, 21 Oct 2026 ~11:52, jamals-web 157.22.129.112)

- RAM: MemTotal 7.76 GiB, **MemAvailable 5.09 GiB** (> 3.6 GiB threshold: D4a VM upgrade NOT needed; no lean mode). Swap 4 GiB, unused.
- CPU: 4. Disk: 40 GB, 6.0 GB free (85 %).
- jgapps container (release c6b7372f): cgroup memory.peak 371 MiB, current 300 MiB; docker stats 247 MiB. Every container on the box together is about 1.9 GiB.
- Production Node: v22.23.3, ICU 78.3, Unicode 17.0, tz 2026c. (Goldens must be recorded on Node 22 with ICU 78; PyICU needs to match ICU 78 for NFKC.)
- Caddy: v2.11.4.
- Postgres: **18.6** (Alpine), max_connections 100, 16 in use. (The plan text said 16; it is 18.)
- One daily jgapps dump: 194 KB (4 users).
