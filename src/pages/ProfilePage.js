import React, { useState, useEffect } from "react";
import { API, graphqlOperation, input } from "aws-amplify";
// prettier-ignore
// import { Table, Button, Notification, MessageBox, Message, Tabs, Icon, Form, Dialog, Input, Card, Tag } from 'element-react'

const getUser = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      username
      email
      registered
      orders {
        items {
          id
          product{
            id
            description
            price
            owner
            createdAt
          }
          shippingAddress{
            city
            country
            address_line1
            address_state  
            address_zip
          }
          createdAt
          updatedAt
        }
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;

const ProfilePage = ({ user }) => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (user) {
      getUserData(user.attributes.sub);
    }
  }, []);

  const getUserData = async (userId) => {
    input = {
      id: userId,
    };
    const result = await API.graphql(graphqlOperation(getUser, input));
    setOrders(result.data.getUser.orders.items);
  };

  return <></>;
};

export default ProfilePage;
