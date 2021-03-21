import React from "react";
import { API } from "aws-amplify";
import { Notification, Message } from "element-react";
import StripeCheckout from "react-stripe-checkout";

const stripeConfig = {
  currency: "USD",
  publishableAPIKey:
    "pk_test_51IWundSFKRW4ibNg4FzNg2tlzcXz4zkTE7yZ6u1IQvTzp6l0r7JqQ9jIlepnSKpvf1oWFHzE3A4GQIGsEc8LSBbN00ktpthm4n",
};


const PayButton = ({ product, user }) => {

  const handleCharge = async (token) => {
    try {
      const result = await API.post("orderLambdaStripe", "/stripe-charge", {
        body: {
          token: token,
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
      billingAddress={product.shipped}
      shippingAddress={product.shipped}
      locale="auto"
      allowRememberMe={false}
    />
  );
};

export default PayButton;
