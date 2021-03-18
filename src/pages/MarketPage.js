import React, { useEffect, useState } from "react";
import { API, graphqlOperation } from "aws-amplify";
import { useParams, Link } from "react-router-dom";
import { Loading, Tabs, Icon } from "element-react";
import { getMarket } from "../graphql/queries";
import NewProduct from "../components/NewProduct";
import Product from "../components/Product";

const MarketPage = (props) => {
  const { marketId } = useParams();
  const [market, setMarket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarketOwner, setIsMarketOwner] = useState(false);

  useEffect(() => {
    handleGetMarket();
  }, []);

  const handleGetMarket = async () => {
    // console.log(user);
    const input = {
      id: marketId,
    };
    const result = await API.graphql(graphqlOperation(getMarket, input));
    // console.log(result);
    await setMarket((prevMarket) => {
      if (result.data.getMarket) {
        checkMarketOwner(result.data.getMarket.owner);
        return result.data.getMarket;
      } else {
        return prevMarket;
      }
    });
    // checkMarketOwner();
    setIsLoading(false);
  };

  const checkMarketOwner = (owner) => {
    const { user } = props;
    if (user) {
      setIsMarketOwner(user.username === owner);
    }
  };

  return isLoading ? (
    <Loading fullscreen={true} />
  ) : (
    <>
      {/* Back button */}
      <Link className="link" to="/">
        Back to Markets List
      </Link>

      {/* Market MetaData */}
      <span className="items-center pt-2">
        <h2 className="mb-mr">{market.name}</h2>- {market.owner}
      </span>
      <div className="items-center pt-2">
        <span style={{ color: "var(--lightSquidInk", paddingBottom: "1em" }}>
          <Icon name="date" className="icon" />
          {market.createdAt}
        </span>
      </div>

      {/* New Product */}
      <Tabs type="border-card" value={isMarketOwner ? "1" : "2"}>
        {isMarketOwner && (
          <Tabs.Pane
            label={
              <>
                <Icon name="plus" className="icon" />
                  Add Product
              </>
            }
            name="1"
          >
            <NewProduct marketId={marketId} />
          </Tabs.Pane>
        )}

        {/* Products List */}
        <Tabs.Pane
          label={
            <>
              <Icon name="menu" className="icon" />
              Products ({market.products.items.length})
            </>
          }
          name="2"
        >
          {/* <div className="product-list">
            {market.products.items.map((product) => {
              <Product product={product} />
            })}
          </div> */}
        </Tabs.Pane>
      </Tabs>
    </>
  );
};

export default MarketPage;
