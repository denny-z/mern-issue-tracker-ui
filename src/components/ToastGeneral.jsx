import React from 'react';
import { connect } from 'react-redux';
import { getErrorMessage } from '../redux/selectors.js';
import withToast from '../withToast.jsx';

class ToastGeneral extends React.Component {
  componentDidUpdate() {
    const { showError, errorMessage } = this.props;
    if (errorMessage) {
      showError(errorMessage);
    }
  }

  render() {
    return (
      <>
      </>
    );
  }
}

const mapState = state => ({
  errorMessage: getErrorMessage(state),
});

const Connected = connect(mapState)(ToastGeneral);
export default withToast(Connected);
