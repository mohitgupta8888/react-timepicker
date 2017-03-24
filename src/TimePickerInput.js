import React from 'react'
import TimePicker from './TimePicker'

class TimePickerInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: props.value,
            open: false
        }

        this.inputChange = this.inputChange.bind(this);
        this.inputFocus = this.inputFocus.bind(this);
        this.inputBlur = this.inputBlur.bind(this);
        this.keyDownHandler = this.keyDownHandler.bind(this);
    }

    inputChange(e) {
        this.setState({ value: e.target.value });
    }

    inputFocus() {
        this.setState({ open: true });
    }

    inputBlur() {
        //this.setState({ open: false });
    }

    keyDownHandler(e) {
        if (this.state.open)
            return;

        if (e.keyCode == 40) {
            // show the list!
            this.setState({ open: true });
        }
    }

    onTimeSelect(timeString) {
        if (timeString)
            this.setState({ value: timeString, open: false });
    }

    render() {
        var timePicker;
        if (this.state.open)
            timePicker = <TimePicker
                open={this.state.open}
                timeFormat={"h:i a"}
                step="5"
                value={this.state.value}
                onSelect={this.onTimeSelect.bind(this) }
                onClose={() => { this.setState({ open: false }) } }
                inputRef={this.inputRef} />
        return (
            <div>
                <input
                    type="text"
                    value={this.state.value}
                    onChange={this.inputChange}
                    onFocus={this.inputFocus}
                    onBlur={this.inputBlur}
                    onKeyDown={this.keyDownHandler}
                    ref={(input) => this.inputRef = input} />
                {timePicker}
            </div>
        )

    }
}

export default TimePickerInput