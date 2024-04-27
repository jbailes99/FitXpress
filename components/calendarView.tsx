import React from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css' // Import the styles

function CalendarView({ selectedDate, onDateChange }) {
  return (
    <div>
      <DatePicker
        className='text-black rounded-xl text-xl mt-2 text-center'
        selected={selectedDate}
        onChange={onDateChange}
      />
    </div>
  )
}

export default CalendarView
