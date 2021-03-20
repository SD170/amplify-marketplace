import React from "react";
import { Notification, Message } from "element-react";
import StripeCheckout from "react-stripe-checkout";

const stripeConfig = {
  currency: "USD",
  publishableAPIKey:
    "pk_test_51IWundSFKRW4ibNg4FzNg2tlzcXz4zkTE7yZ6u1IQvTzp6l0r7JqQ9jIlepnSKpvf1oWFHzE3A4GQIGsEc8LSBbN00ktpthm4n",
};
const PayButton = ({ product, user }) => {
  return (
    <StripeCheckout
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
