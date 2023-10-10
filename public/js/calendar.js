document.addEventListener('DOMContentLoaded', function () {
  var calendarEl = document.getElementById('calendar');

  var calendar = new FullCalendar.Calendar(calendarEl, {
    headerToolbar: {
      left: 'prev,next,today',
      center: 'title',
      right: '',
    },
    initialView: 'timeGridDay',
    initialDate: new Date(),
    navLinks: true, // can click day/week names to navigate views
    dayMaxEvents: true, // allow "more" link when too many events
    dayHeaders: true,
    events: '/calendar-groups',
  });

  calendar.render();
});
