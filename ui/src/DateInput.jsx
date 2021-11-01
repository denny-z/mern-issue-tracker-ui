import React, { Component } from 'react';

function displayFormat(date) {
  return (date != null) ? date.toDateString() : '';
}

function editFormat(date) {
  return (date != null) ? date.toISOString().substr(0, 10) : '';
}

function stringToDate(str) {
  const value = new Date(str);
  return Number.isNaN(value.getTime()) ? null : value;
}

export default class DateInput extends Component {
  constructor(props) {
    super(props);
    const { value: propsValue } = this.props;
    this.state = {
      value: editFormat(propsValue),
      isFocused: false,
      isValid: true,
    };

    this.onChange = this.onChange.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onFocus = this.onFocus.bind(this);
  }

  onChange(e) {
    const { value } = e.target;
    if (value.match(/^[\d-]*$/)) {
      this.setState({ value });
    }
  }

  onFocus() {
    this.setState({ isFocused: true });
  }

  onBlur(e) {
    const { value, isValid: isValidOld } = this.state;
    const { onValidityChange, onChange } = this.props;
    const dateValue = stringToDate(value);
    const isValid = value === '' || dateValue !== null;
    if (isValid !== isValidOld && (typeof onValidityChange === 'function')) {
      onValidityChange(e, isValid);
    }
    this.setState({ isFocused: false, isValid });
    if (isValid) onChange(e, dateValue);
  }

  render() {
    const { value, isFocused, isValid } = this.state;
    const { value: origValue, name } = this.props;
    const className = (!isFocused && !isValid) ? 'invalid' : null;
    const displayValue = (isFocused || !isValid) ? value : displayFormat(origValue);

    return (
      <input
        type="text"
        size={20}
        name={name}
        className={className}
        value={displayValue}
        placeholder={isFocused ? 'yyyy-mm-dd' : null}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
        onChange={this.onChange}
      />
    );
  }
}
