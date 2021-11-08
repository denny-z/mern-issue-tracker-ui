/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react';
import store from './store.js';

export default class About extends Component {
  render() {
    return (
      <div className="text-center">
        <h3>{store.initialData ? store.initialData.about : 'unknown'}</h3>
        <h4>API version v1.0</h4>
      </div>
    );
  }
}
