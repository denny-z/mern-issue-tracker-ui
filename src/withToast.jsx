import React from 'react';
import Toast from './Toast.jsx';

export default function withToast(OriginalComponent) {
  return class ToastWrapper extends React.Component {
    constructor(props) {
      super(props);
      this.dismissToast = this.dismissToast.bind(this);
      this.showError = this.showError.bind(this);
      this.showSuccess = this.showSuccess.bind(this);
      this.state = {
        needShow: false,
        message: '',
        bsStyle: 'info',
      };
    }

    dismissToast() {
      this.setState({ needShow: false });
    }

    showError(message) {
      this.setState({ message, needShow: true, bsStyle: 'danger' });
    }

    showSuccess(message) {
      this.setState({ message, needShow: true, bsStyle: 'success' });
    }

    render() {
      const { needShow, message, bsStyle } = this.state;

      return (
        <React.Fragment>
          <OriginalComponent
            showError={this.showError}
            showSuccess={this.showSuccess}
            dismissToast={this.dismissToast}
            {...this.props}
          />
          <Toast bsStyle={bsStyle} needShow={needShow} onDismiss={this.dismissToast}>
            {message}
          </Toast>
        </React.Fragment>
      );
    }
  };
}
