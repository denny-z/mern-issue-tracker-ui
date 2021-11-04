import React from 'react';
import { Alert, Collapse } from 'react-bootstrap';

export default class Toast extends React.Component {
  componentDidUpdate() {
    const { needToShow, onDismiss } = this.props;
    if (needToShow) {
      clearTimeout(this.dismissTimer);
      this.dismissTimer = setTimeout(onDismiss, 5000);
    }
  }

  componentWillUnmount() {
    clearTimeout(this.dismissTimer);
  }

  render() {
    const {
      needToShow, bsStyle, onDismiss, children,
    } = this.props;


    return (
      <Collapse in={needToShow}>
        <div style={{ position: 'fixed', bottom: 20, right: 20 }}>
          <Alert bsStyle={bsStyle} onDismiss={onDismiss}>
            {children}
          </Alert>
        </div>
      </Collapse>
    );
  }
}
