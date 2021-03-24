import React, { useEffect, useState, useContext } from "react";
import { API, graphqlOperation } from "aws-amplify";
import { useParams, Link } from "react-router-dom";
import { Loading, Tabs, Icon } from "element-react";
// import { getMarket } from "../graphql/queries";
import Product from "../components/Product";
import NewProduct from "../components/NewProduct";
import {
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct,
} from "../graphql/subscriptions";
import { UserContext } from "../App";
import { formatProductDate } from "../utils/index";

const getMarket = /* GraphQL */ `
  query GetMarket($id: ID!) {
    getMarket(id: $id) {
      id
      name
      products(sortDirection: DESC, limit: 999) {
        items {
          id
          description
          price
          shipped
          owner
          file {
            key
          }
          createdAt
          updatedAt
        }
        nextToken
      }
      tags
      owner
      createdAt
      updatedAt
    }
  }
`;

const MarketPage = (props) => {
  //we need owner for subscription
  const { user } = useContext(UserContext);

  const { marketId } = useParams();
  const [market, setMarket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarketOwner, setIsMarketOwner] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  useEffect(() => {
    handleGetMarket();

    const createProductListener = API.graphql(
      graphqlOperation(onCreateProduct, { owner: user.attributes.sub })
    ).subscribe({
      next: (productData) => {
        const createdProduct = productData.value.data.onCreateProduct;
        //check and remove if any productId is same as the created productId
        setMarket((prevMarket) => {
          const previousProducts = prevMarket.products.items.filter(
            (item) => item.id !== createdProduct.id
          );
          const updatedProducts = [createdProduct, ...previousProducts];

          const updatedMarket = { ...prevMarket };
          updatedMarket.products.items = updatedProducts;
          return updatedMarket;
        });
      },
    });

    const updateProductListener = API.graphql(
      graphqlOperation(onUpdateProduct, { owner: user.attributes.sub })
    ).subscribe({
      next: (productData) => {
        const updatedProduct = productData.value.data.onUpdateProduct;
        setMarket((prevMarket) => {
          const updatedProductIndex = prevMarket.products.items.findIndex(
            (item) => item.id === updatedProduct.id
          );
          const updatedProducts = [
            ...prevMarket.products.items.slice(0, updatedProductIndex),
            updatedProduct,
            ...prevMarket.products.items.slice(updatedProductIndex + 1),
          ];

          const updatedMarket = { ...prevMarket };
          updatedMarket.products.items = updatedProducts;
          return updatedMarket;
        });
      },
    });

    const deleteProductListener = API.graphql(
      graphqlOperation(onDeleteProduct, { owner: user.attributes.sub })
    ).subscribe({
      next: (productData) => {
        const deletedProduct = productData.value.data.onDeleteProduct;
        setMarket((prevMarket) => {
          const updatedProducts = prevMarket.products.items.filter(
            (item) => item.id !== deletedProduct.id
          );

          const updatedMarket = { ...prevMarket };
          updatedMarket.products.items = updatedProducts;
          return updatedMarket;
        });
      },
    });

    const unmountFunction = () => {
      createProductListener.unsubscribe();
      updateProductListener.unsubscribe();
      deleteProductListener.unsubscribe();
    };

    return unmountFunction;
  }, []);

  const handleGetMarket = async () => {
    // console.log(marketId);
    const input = {
      id: marketId,
    };
    const result = await API.graphql(graphqlOperation(getMarket, input));
    // console.log(result);

    setMarket((prevMarket) => {
      if (result.data.getMarket) {
        checkMarketOwner(result.data.getMarket.owner);
        checkEmailVerified();
        return result.data.getMarket;
      } else {
        return prevMarket;
      }
    });
    // checkMarketOwner();
    // console.log(market);
    setIsLoading(false);
  };

  const checkEmailVerified = () => {
    const { userInfo } = props;
    if (userInfo) {
      setIsEmailVerified(userInfo.attributes.email_verified);
    }
  };

  const checkMarketOwner = (owner) => {
    const { user } = props;
    if (user) {
      setIsMarketOwner(user.username === owner);
    }
    //torerender
    // setToggleState(!toggleState);
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
          {formatProductDate(market.createdAt)}
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
            {isEmailVerified ? (
              <NewProduct marketId={marketId} />
            ) : (
              <Link to="/profile">
                Verify Your Email Before Adding Products
              </Link>
            )}
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
          <div className="product-list">
            {market.products.items.map((product) => (
              <Product key={product.id} product={product} />
            ))}
          </div>
        </Tabs.Pane>
      </Tabs>
    </>
  );
};

export default MarketPage;
