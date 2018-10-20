import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Autosuggest from 'react-autosuggest';
import ElasticSearchClient from './elasticSearchClient';

var elasticSearch = new ElasticSearchClient();


const getSuggestions = value => {
  const inputValue = value.trim().toLowerCase();
  const inputLength = inputValue.length;

  return elasticSearch.findDocumentDetails(inputValue)

};

// When suggestion is clicked, Autosuggest needs to populate the input
// based on the clicked suggestion. Teach Autosuggest how to calculate the
// input value for every given suggestion.
const getSuggestionValue = suggestion => suggestion.name;

// Use your imagination to render suggestions.
const renderSuggestion = suggestion => {

  let icon;
  return (
    <div>
      <div style={{ display: "inline-block" }}>
        <div>
          <span className="type" >{suggestion.index}</span>
        </div>

        <div>
          <span className="prop-name" >Match: {suggestion.propertyHit}</span>
        </div>
      </div>
      <div className="suggestion-name" style={{ display: "inline-block" }}>
        {suggestion.name}
      </div>
    </div>

  )
};


class App extends Component {

  constructor() {
    super();
    this.state = {
      value: '',
      currentSearch: {},
      suggestions: [],
      details: {},
      relations: []
    };

    this.history = [];
  }

  onChange = (event, { newValue, method }) => {

    this.setState({
      value: newValue
    });
  };

  onSuggestionSelected = (event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) => {
    let details = elasticSearch.getDocumentDetails(suggestion.id, suggestion.index)
    let relations = elasticSearch.findRelations(suggestion.name);

    this.setState({
      currentSearch: {id:suggestion.name,index:suggestion.index},
      details: details,
      relations: relations
    });

  }


  // Autosuggest will call this function every time you need to update suggestions.
  // You already implemented this logic above, so just use it.
  onSuggestionsFetchRequested = ({ value }) => {
    getSuggestions(value).then((results) => {
      this.setState({
        suggestions: results
      });
    })


  };

  // Autosuggest will call this function every time you need to clear suggestions.
  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  onRelationSelected = (relation) => {

    this.history.push(this.state.currentSearch);

    elasticSearch.findDocumentDetails(relation.id).then((result) => {
      let data = result[0]
      let details = elasticSearch.getDocumentDetails(data.id, relation.type)
      let relations = elasticSearch.findRelations(relation.id);

      this.setState({
        value: relation.id,
        currentSearch: {id:relation.id,index:relation.type},
        details: details,
        relations: relations
      });
    });

  }

  onBackPressed = () => {
    let lastSearch = this.history.pop();

    elasticSearch.findDocumentDetails(lastSearch.id).then((result) => {
      let data = result[0]
      let details = elasticSearch.getDocumentDetails(data.id, lastSearch.index)
      let relations = elasticSearch.findRelations(lastSearch.id);

      this.setState({
        value: lastSearch.id,
        currentSearch: {id:lastSearch.id,index:lastSearch.index},
        details: details,
        relations: relations
      });
    });
  }

  render() {

    const { value, suggestions, details, relations } = this.state;

    // Autosuggest will pass through all these props to the input.
    const inputProps = {
      placeholder: 'Type a programming language',
      value,
      onChange: this.onChange
    };

    let detailsElements = [];
    for (let prop in details) {
      let propValue = details[prop];
      detailsElements.push(<div><span className="prop-name-big"> {prop}</span> <div className="id">{propValue}</div></div>)
    }

    let relationElements = relations.map(x => {
      return (
        <div className="relation" onClick={() => this.onRelationSelected(x)}>
          <span className="prop-name-big"> {x.type}</span>
          <div className="id">{x.id}</div>
        </div>
      );
    })

    return (
      <div className="App">
        <header className="App-header">
          <Autosuggest
            suggestions={suggestions}
            onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
            onSuggestionsClearRequested={this.onSuggestionsClearRequested}
            onSuggestionSelected={this.onSuggestionSelected}
            getSuggestionValue={getSuggestionValue}
            renderSuggestion={renderSuggestion}
            inputProps={inputProps}
          />
          {this.history.length > 0 && <button onClick={this.onBackPressed}>Back</button>} 
          <div style={{ textAlign: 'left', width: '20%', marginTop: '20px' }}>
            <h5>Details</h5>
            {detailsElements}
          </div>
          <div style={{ textAlign: 'left', width: '20%', marginTop: '20px' }}>
            <h5>Relations</h5>
            {relationElements}
          </div>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    );
  }
}

export default App;
