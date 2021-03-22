import React from "react";
import { API, graphqlOperation } from "aws-amplify";
import { Notification, Message } from "element-react";
import StripeCheckout from "react-stripe-checkout";
import { getUser } from "../graphql/queries";

const stripeConfig = {
  currency: "INR",
  publishableAPIKey:
    "pk_test_51IWundSFKRW4ibNg4FzNg2tlzcXz4zkTE7yZ6u1IQvTzp6l0r7JqQ9jIlepnSKpvf1oWFHzE3A4GQIGsEc8LSBbN00ktpthm4n",
};

const PayButton = ({ product, user }) => {
  const getOwnerEmail = async (ownerId) => {
    try {
      const input = {
        id: ownerId,
      };
      const result = await API.graphql(graphqlOperation(getUser, input));
      return result.data.getUser.email;
    } catch (err) {
      console.error(`Error fetching product owner's email`, err);
    }
  };
  const handleCharge = async (token) => {
    try {
      const ownerEmail = await getOwnerEmail(product.owner);
      console.log(ownerEmail);
      const result = await API.post("orderLambdaStripe", "/stripe-charge", {
        body: {
          token: token,
          charge: {
            currency: stripeConfig.currency,
            amount: product.price,
            description: product.description,
          },
          email: {
            customerEmail: user.attributes.email,
            ownerEmail: ownerEmail,
            shipped: product.shipped,
          },
        },
      });
      console.log(result);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <StripeCheckout
      token={handleCharge}
      email={user.attributes.email}
      name={product.description}
      amount={product.price}
      currency={stripeConfig.currency}
      stripeKey={stripeConfig.publishableAPIKey}
      billingAddress={true}
      shippingAddress={product.shipped}
      locale="auto"
      allowRememberMe={false}
    />
  );
};

export default PayButton;
