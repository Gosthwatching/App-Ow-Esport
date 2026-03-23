export function CalendarCard() {
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth()
  const currentDate = today.getDate()

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  // Get first day of month and number of days
  const firstDay = new Date(currentYear, currentMonth, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  // Generate calendar dates
  const dates: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) {
    dates.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    dates.push(i)
  }

  // Show start date for display
  const startDate = dates.find((d) => d !== null) || 1

  return (
    <section className="calendar-card">
      <div className="calendar-head">
        <span>
          {monthNames[currentMonth]} {currentYear}
        </span>
        <span>{currentDate}</span>
      </div>
      <div className="calendar-grid">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <small key={day}>{day}</small>
        ))}
        {Array.from({ length: 7 }).map((_, i) => {
          const date = startDate + i
          return (
            <button
              key={date}
              className={date === currentDate ? 'selected' : ''}
              disabled={date > daysInMonth}
            >
              {date <= daysInMonth ? date : ''}
            </button>
          )
        })}
      </div>
    </section>
  )
}
