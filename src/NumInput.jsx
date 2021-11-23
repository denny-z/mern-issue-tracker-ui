import React from 'react';

function formatNumToStr(num) {
  return num != null ? num.toString() : '';
}

function formatStrToNum(str) {
  const value = parseInt(str, 10);
  return Number.isNaN(value) ? null : value;
}

export default class NumInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: formatNumToStr(props.value) };
    this.onChange = this.onChange.bind(this);
    this.onBlur = this.onBlur.bind(this);
  }

  onChange(event) {
    const { value } = event.target;
    if (value.match(/^\d*$/)) {
      this.setState({ value });
    }
  }

  onBlur(event) {
    const { onChange } = this.props;
    const { value } = this.state;
    onChange(event, formatStrToNum(value));
  }

  render() {
    const { value } = this.state;
    return (
      <input
        type="text"
        {...this.props}
        value={value}
        onBlur={this.onBlur}
        onChange={this.onChange}
      />
    );
  }
}
