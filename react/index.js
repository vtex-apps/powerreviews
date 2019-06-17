import React, { Component } from "react";
import Reviews from "./Reviews";

class Index extends Component {

  render () {
    return (
      <div>
        <Reviews productQuery={{ product: { linkText: 'patagn-p-6_logo_responsibili-tee_mens' } }} />
      </div>
    )
  }

}

export default Index
