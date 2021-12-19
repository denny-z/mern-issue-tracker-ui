import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { hideError } from '../redux/actions.js';
import {
  getErrorMessage, needShowError,
} from '../redux/selectors.js';
import Toast from '../Toast.jsx';

export default function ToastGlobal() {
  const bsStyle = 'danger';
  const errorMessage = useSelector(getErrorMessage);
  const needShow = useSelector(needShowError);

  const dispatch = useDispatch();
  const hide = () => dispatch(hideError());

  return (
    <Toast needShow={needShow} bsStyle={bsStyle} onDismiss={hide}>
      <>
        {errorMessage}
      </>
    </Toast>
  );
}
