import React, { Component } from 'react';
import store from './store.js';
import graphQLFetch from './graphQLFetch.js';

export default class About extends Component {
  static async fetchData() {
    const data = await graphQLFetch('query About { about }');
    return data;
  }

  constructor(props) {
    super(props);
    const apiAbout = store.initialData ? store.initialData.about : null;
    delete store.initialData;
    this.state = { apiAbout };
  }

  async componentDidMount() {
    const { apiAbout } = this.state;
    if (apiAbout == null) {
      const data = await About.fetchData();
      this.setState({ apiAbout: data.about });
    }
  }


  render() {
    const { apiAbout } = this.state;

    return (
      <div className="text-center">
        <h3>{apiAbout}</h3>
        <h4>API version v1.0</h4>
      </div>
    );
  }
}
