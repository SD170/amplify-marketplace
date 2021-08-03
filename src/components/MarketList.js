import React from "react";
import { graphqlOperation } from "aws-amplify";
import { Connect } from "aws-amplify-react";
import { Loading, Card, Icon, Tag } from "element-react";
import { Link, useHistory } from "react-router-dom";
import { listMarkets } from "../graphql/queries";
import { onCreateMarket } from "../graphql/subscriptions";
import Error from "./Error";

const MarketList = ({ searchResults, searchTerm, hasSearched }) => {
  const history = useHistory();
  const onNewMarket = (prevQuery, newData) => {
    let updatedQuery = { ...prevQuery };
    const updatedMarketList = [
      newData.onCreateMarket,
      ...prevQuery.listMarkets.items,
    ];
    updatedQuery.listMarkets.items = updatedMarketList;
    return updatedQuery;
  };
  return (
    <Connect
      query={graphqlOperation(listMarkets)}
      subscription={graphqlOperation(onCreateMarket)}
      onSubscriptionMsg={onNewMarket}
    >
      {({ data, loading, errors }) => {
        if (errors.length > 0) return <Error errors={errors} />;
        if (loading || !data.listMarkets) return <Loading fullscreen={true} />;
        const markets =
          searchResults.length > 0 || hasSearched
            ? searchResults
            : data.listMarkets.items;

        return (
          <>
            {searchResults.length > 0 || hasSearched ? (
              searchResults.length > 0 ? (
                <h2 className="text-green">
                  <Icon type="success" name="check" className="icon" />
                  {searchResults.length} Results for Term "{searchTerm}"
                </h2>
              ) : (
                <h2 className="text-red">
                  <Icon type="success" name="close" className="icon" />
                  {searchResults.length} Results for Term "{searchTerm}"
                </h2>
              )
            ) : (
              <h2 className="header">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-shop large-icon"
                  viewBox="0 0 16 16"
                >
                  <path d="M2.97 1.35A1 1 0 0 1 3.73 1h8.54a1 1 0 0 1 .76.35l2.609 3.044A1.5 1.5 0 0 1 16 5.37v.255a2.375 2.375 0 0 1-4.25 1.458A2.371 2.371 0 0 1 9.875 8 2.37 2.37 0 0 1 8 7.083 2.37 2.37 0 0 1 6.125 8a2.37 2.37 0 0 1-1.875-.917A2.375 2.375 0 0 1 0 5.625V5.37a1.5 1.5 0 0 1 .361-.976l2.61-3.045zm1.78 4.275a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 1 0 2.75 0V5.37a.5.5 0 0 0-.12-.325L12.27 2H3.73L1.12 5.045A.5.5 0 0 0 1 5.37v.255a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0zM1.5 8.5A.5.5 0 0 1 2 9v6h1v-5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v5h6V9a.5.5 0 0 1 1 0v6h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1V9a.5.5 0 0 1 .5-.5zM4 15h3v-5H4v5zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3zm3 0h-2v3h2v-3z" />
                </svg>
                Markets
              </h2>
            )}

            {markets.map((market) => (
              <div className="my-2" key={market.id}>
                <div
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    history.push(`/markets/${market.id}`);
                  }}
                >
                  <Card
                    bodyStyle={{
                      padding: "0.7em",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <span className="flex">
                        <Link className="link" to={`/markets/${market.id}`}>
                          {market.name}
                        </Link>
                        <span style={{ color: "var(--darkAmazonOrange)" }}>
                          {(market.products.items &&
                            market.products.items.length) ||
                            0}
                          {/* {console.log(market)} */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            className="bi bi-cart-plus-fill"
                            viewBox="0 0 16 16"
                          >
                            <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1H.5zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM9 5.5V7h1.5a.5.5 0 0 1 0 1H9v1.5a.5.5 0 0 1-1 0V8H6.5a.5.5 0 0 1 0-1H8V5.5a.5.5 0 0 1 1 0z" />
                          </svg>
                        </span>
                      </span>
                      <div style={{ color: "var(--lightSquidInk" }}>
                        {market.owner}
                      </div>
                    </div>
                    <div>
                      {market.tags &&
                        market.tags.map((tag) => (
                          <Tag key={tag} type="danger" className="mx-1">
                            {tag}
                          </Tag>
                        ))}
                    </div>
                  </Card>
                </div>
              </div>
            ))}
          </>
        );
      }}
    </Connect>
  );
};

export default MarketList;
