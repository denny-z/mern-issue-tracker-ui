import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { hideNotification } from '../redux/actions.js';
import {
  getComponentNotification,
  getNotifcationMessage, isNotificationError, needShowError,
} from '../redux/selectors.js';
import Toast from '../Toast.jsx';

export default function ToastGlobal() {
  const message = useSelector(getNotifcationMessage);
  const component = useSelector(getComponentNotification);

  const needShow = useSelector(needShowError);
  const isError = useSelector(isNotificationError);

  const bsStyle = isError ? 'danger' : 'success';

  const dispatch = useDispatch();
  const hide = () => dispatch(hideNotification());

  const content = component ? React.createElement(component.name, component.props) : message;

  return (
    <Toast needShow={needShow} bsStyle={bsStyle} onDismiss={hide}>
      <>{content}</>
    </Toast>
  );
}
