import React from "react";
import { API, graphqlOperation } from "aws-amplify";
import { Notification, Message } from "element-react";
import StripeCheckout from "react-stripe-checkout";
import { getUser } from "../graphql/queries";
import { createOrder } from "../graphql/mutations";
import { history } from "../App";

const stripeConfig = {
  currency: "INR",
  publishableAPIKey:
    "pk_test_51IWundSFKRW4ibNg4FzNg2tlzcXz4zkTE7yZ6u1IQvTzp6l0r7JqQ9jIlepnSKpvf1oWFHzE3A4GQIGsEc8LSBbN00ktpthm4n",
};

const PayButton = ({ product, userInfo }) => {
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

  const createShippingAddress = (source) =>({
    city:source.address_city,
    country:source.address_country,
    address_line1:source.address_line1,
    address_state:source.address_state,
    address_zip:source.address_zip,
  })

  const handleCharge = async (token) => {
    try {
      const ownerEmail = await getOwnerEmail(product.owner);
      console.log(ownerEmail,token);
      const result = await API.post("orderLambdaStripe", "/stripe-charge", {
        body: {
          token: token,
          charge: {
            source:token.card,
            currency: stripeConfig.currency,
            amount: product.price,
            description: product.description,
          },
          email: {
            customerEmail: userInfo.attributes.email,
            ownerEmail: ownerEmail,
            shipped: product.shipped,
          },
        },
      });

      if(result.charge.status === 'succeeded'){
        let shippingAddress = null;
        if(product.shipped){
          shippingAddress = createShippingAddress(result.charge.source);
        }

        const input = {
          orderUserId:userInfo.attributes.sub,
          orderProductId:product.id,
          shippingAddress:shippingAddress
        }

        const order = await API.graphql(graphqlOperation(createOrder,{input:input}));
        console.log({order});
        Notification({
          title:"Success",
          message: `${result.message}`,
          type: 'success',
          duration:3000
        })
        //Redirecting to the Home page
        setTimeout(()=>{
          history.push('/');
          Message({
            type:"info",
            message:"Check your verified email for order details",
            duration:"5000",
            showClose:true
          })
        },3000)

      }
    } catch (err) {
      console.error(err);
      Notification.error({
        title:"Error",
        message:`${err.message || 'Error processing order'}`,
        type:"error"
      })
    }
  };

  return (
    <StripeCheckout
      token={handleCharge}
      email={userInfo.attributes.email}
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
