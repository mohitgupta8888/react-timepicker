import React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import TimePickerInput from '../src/TimePickerInput'
import TimePicker from '../src/TimePicker'

storiesOf('Time Picker', module)
  .add('As Input', () => (
    <TimePickerInput value="05:55 pm"></TimePickerInput>
  ))
  .add('As Dropdown', () => (
    <TimePicker timeFormat={"h:i A"} useSelect={true} />
  ));