import React, { useState } from "react";
import { API, graphqlOperation } from "aws-amplify";
import { listMarkets } from "../graphql/queries";
import NewMarket from "../components/NewMarket";
import MarketList from "../components/MarketList";

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchTerm = async (e) => {
    try {
      e.preventDefault();
      setIsSearching(true);
      console.log("Submitted", searchTerm);
      const result = await API.graphql(
        graphqlOperation(listMarkets, {
          filter: {
            or: [
              { name: { contains: searchTerm } },
              { owner: { contains: searchTerm } },
              { tags: { contains: searchTerm } },
            ],
          },
        })
      );
      console.log(result);
      setSearchResults(result.data.listMarkets.items);
      setIsSearching(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchTermChange = (searchTerm) => {
    setSearchTerm(searchTerm);
    // console.log("onchange", searchTerm);
  };
  const handleClearSearchTerm = () => {
    setSearchTerm("");
    setSearchResults([]);
    // console.log("Cleared");
  };
  return (
    <>
      <NewMarket
        searchTerm={searchTerm}
        isSearching={isSearching}
        handleSearchTermChange={handleSearchTermChange}
        handleSearchTerm={handleSearchTerm}
        handleClearSearchTerm={handleClearSearchTerm}
      />
      <MarketList searchResults={searchResults} searchTerm={searchTerm} />
    </>
  );
};

export default HomePage;
