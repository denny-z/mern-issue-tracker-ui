import React, { Component } from 'react';

function format(text) {
  return text != null ? text : '';
}

function unformat(text) {
  return text.trim().length === 0 ? null : text;
}

export default class TextInput extends Component {
  constructor(props) {
    super(props);
    this.state = { value: format(props.value) };
    this.onChange = this.onChange.bind(this);
    this.onBlur = this.onBlur.bind(this);
  }

  onChange(e) {
    const { checkValid, onValidityChange } = this.props;
    const { value } = e.target;

    if (!checkValid || !onValidityChange) {
      this.setState({ value });
      return;
    }

    const isValid = checkValid(value);
    this.setState({ value });
    onValidityChange(e, isValid);
  }

  onBlur(e) {
    const { value } = this.state;
    const { onChange } = this.props;
    onChange(e, unformat(value));
  }

  render() {
    const { value } = this.state;
    const { tag, checkValid, onValidityChange, ...props } = this.props;

    return (
      React.createElement(tag, {
        ...props,
        value,
        onBlur: this.onBlur,
        onChange: this.onChange,
      })
    );
  }
}
