import { getCheckinCalendar, getCheckinSummary, todayStr } from '../../services/squad/cloudCheckin';

const WEEK_LABELS = ['日', '一', '二', '三', '四', '五', '六'];

const MILESTONES = [
  { key: 's3', icon: '🔥', label: '连续3天', test: (s) => s.streakDays >= 3 },
  { key: 's7', icon: '🔥', label: '连续7天', test: (s) => s.streakDays >= 7 },
  { key: 's30', icon: '🏆', label: '连续30天', test: (s) => s.streakDays >= 30 },
  { key: 't10', icon: '🍽️', label: '累计10顿', test: (s) => s.totalCount >= 10 },
  { key: 't50', icon: '🍚', label: '累计50顿', test: (s) => s.totalCount >= 50 },
  { key: 't100', icon: '🥇', label: '累计100顿', test: (s) => s.totalCount >= 100 },
];

function pad(n) {
  return String(n).padStart(2, '0');
}

Page({
  data: {
    weekLabels: WEEK_LABELS,
    summary: { streakDays: 0, totalCount: 0, monthDays: 0, todayDone: false },
    year: 0,
    month: 0,
    weeks: [],
    milestones: MILESTONES.map((ms) => ({ ...ms, unlocked: false })),
  },

  onLoad() {
    const [year, month] = todayStr().split('-').map(Number);
    this.setData({ year, month });
    this.refresh();
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const monthKey = `${this.data.year}-${pad(this.data.month)}`;
    Promise.all([
      getCheckinSummary().catch(() => null),
      getCheckinCalendar(monthKey).catch(() => ({ days: [] })),
    ]).then(([summary, calendar]) => {
      const patch = { weeks: this.buildWeeks(this.data.year, this.data.month, (calendar && calendar.days) || []) };
      if (summary) {
        patch.summary = summary;
        patch.milestones = MILESTONES.map((ms) => ({ ...ms, unlocked: ms.test(summary) }));
      }
      this.setData(patch);
    });
  },

  buildWeeks(year, month, days) {
    const dayMap = {};
    days.forEach((d) => {
      dayMap[d.date] = d.count;
    });
    const today = todayStr();
    const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const cells = [];
    for (let i = 0; i < firstWeekday; i += 1) cells.push({ blank: true, k: `b${i}` });
    for (let d = 1; d <= daysInMonth; d += 1) {
      const date = `${year}-${pad(month)}-${pad(d)}`;
      cells.push({ day: d, date, k: date, count: dayMap[date] || 0, done: !!dayMap[date], isToday: date === today });
    }
    while (cells.length % 7 !== 0) cells.push({ blank: true, k: `e${cells.length}` });
    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    return weeks;
  },

  prevMonth() {
    let { year, month } = this.data;
    month -= 1;
    if (month < 1) {
      month = 12;
      year -= 1;
    }
    this.setData({ year, month }, () => this.refresh());
  },

  nextMonth() {
    let { year, month } = this.data;
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
    this.setData({ year, month }, () => this.refresh());
  },

  onShareAppMessage() {
    const { streakDays, totalCount } = this.data.summary;
    return {
      title: `我们家已经连续光盘 ${streakDays} 天，累计光盘 ${totalCount} 顿！`,
      path: '/pages/home/home',
    };
  },
});
